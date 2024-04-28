// Copyright 2023 IAC. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mdaxf/iac/com"
	"github.com/mdaxf/iac/config"
	"github.com/mdaxf/iac/health"
	"github.com/mdaxf/iac/logger"
)

var (
	nodedata      map[string]interface{}
	nodecomponent map[string]interface{}
)

type AllowUrlConfig struct {
	AllowedPrefixes []string
}

// main is the entry point of the program.
// It loads the configuration file, initializes the database connection, and starts the server.
// It also loads controllers dynamically and statically based on the configuration file.
// The server is started on the port specified in the configuration file.
// The server serves static files from the portal directory.
// The server also serves static files from the plugins directory.

func main() {

	startTime := time.Now()
	nodecomponent = make(map[string]interface{})
	nodedata = make(map[string]interface{})
	nodedata["Name"] = "iac-ui"
	nodedata["AppID"] = uuid.New().String()
	nodedata["Description"] = "IAC WebServer"
	nodedata["Type"] = "WebServer"
	nodedata["Version"] = "1.0.0"
	nodedata["StartTime"] = time.Now().UTC()
	nodedata["Status"] = "Running"

	gconfig, err := config.LoadGlobalConfig()

	if err != nil {
		log.Fatalf("Failed to load global configuration: %v", err)
		//ilog.Error(fmt.Sprintf("Failed to load global configuration: %v", err))
	}
	initializeloger(gconfig)

	ilog := logger.Log{ModuleName: logger.Framework, User: "System", ControllerName: "iac-ui"}
	ilog.Debug("Start the iac-ui")

	r := gin.Default()

	// Set up a reverse proxy for the backend server
	appserver := gconfig.AppServer["url"]

	if appserver == nil {
		log.Fatalf("Failed to load application server url configuration!")
		panic("Failed to load application server url configuration!")
	}
	appserverstr := com.ConverttoString(appserver)

	ilog.Debug(fmt.Sprintf("load the app server: %s", appserverstr))

	backendURL, err := url.Parse(appserverstr)

	if err != nil {
		panic(err)
	}

	clientconfig := make(map[string]interface{})
	clientconfig["signalrconfig"] = gconfig.SingalRConfig
	clientconfig["instance"] = gconfig.Instance
	clientconfig["instanceType"] = gconfig.InstanceType
	clientconfig["instanceName"] = gconfig.InstanceName

	r.GET("/config", func(c *gin.Context) {
		c.JSON(http.StatusOK, clientconfig)
	})

	r.GET("/debug", func(c *gin.Context) {
		headers := c.Request.Header
		useragent := c.Request.Header.Get("User-Agent")
		ilog.Debug(fmt.Sprintf("User-Agent: %s, headers: %v", useragent, headers))
		debugInfo := map[string]interface{}{
			"Route":          c.FullPath(),
			"requestheader":  headers,
			"User-Agent":     useragent,
			"requestbody":    c.Request.Body,
			"responseheader": c.Writer.Header(),
			"Method":         c.Request.Method,
		}

		c.JSON(http.StatusOK, debugInfo)
	})

	r.GET("/portalhealth", func(c *gin.Context) {
		ilog.Debug("Portal Health Check")
		result, err := CheckServiceStatus(ilog)
		if err != nil {
			ilog.Error(fmt.Sprintf("Portal Health Check error: %v", err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
	})

	proxy := httputil.NewSingleHostReverseProxy(backendURL)

	// Modify the Director to exclude requests starting with "/portal"
	origDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		if !strings.HasPrefix(req.URL.Path, "/portal") &&
			!strings.HasPrefix(req.URL.Path, "/debug") &&
			!strings.HasPrefix(req.URL.Path, "/config") &&
			!strings.HasPrefix(req.URL.Path, "/portalhealth") &&
			!strings.HasPrefix(req.URL.Path, "/dashboard") {
			ilog.Debug(req.URL.Path)
			origDirector(req)
		}
	}
	/*		allowurlprefixes := []string{"portal", "debug", "config", "portalhealth"}

			WebServerConfig := gconfig.WebServerConfig
			if WebServerConfig != nil {
				ilog.Debug(fmt.Sprintf("Webserver config: %v", WebServerConfig))
				proxycfg := WebServerConfig["proxy"].(map[string]interface{})
				if proxycfg != nil {
					ilog.Debug(fmt.Sprintf("Webserver proxy config: %v", proxycfg))

					for key, _ := range proxycfg {
						allowurlprefixes = append(allowurlprefixes, key)
					}
				}
			}

			ilog.Debug(fmt.Sprintf("Allow URL Prefixes: %v", allowurlprefixes))

			allowurlconfig := &AllowUrlConfig{
				AllowedPrefixes: allowurlprefixes,
			}

			ilog.Debug(fmt.Sprintf("Allow URL Config: %v", allowurlconfig))

			proxy.Director = customDirector(allowurlconfig, origDirector)

			ilog.Debug(fmt.Sprintf("Proxy Director: %v", proxy.Director))  */
	// Set up a route to handle all requests
	r.NoRoute(func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	})

	port := com.ConverttoInt(gconfig.WebServerConfig["port"])
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()

		if gconfig.WebServerConfig != nil {
			webserverconfig := gconfig.WebServerConfig
			ilog.Debug(fmt.Sprintf("Webserver config: %v", webserverconfig))

			paths := webserverconfig["paths"].(map[string]interface{})

			for key, value := range paths {
				ilog.Debug(fmt.Sprintf("Webserver path: %s configuration: %v", key, value))
				pathstr := value.(map[string]interface{})
				path := pathstr["path"].(string)
				home := pathstr["home"].(string)

				if path != "" {
					r.Static(fmt.Sprintf("/%s", key), path)
					ilog.Debug(fmt.Sprintf("Webserver path: /%s with %s", key, path))
				} else {
					ilog.Error(fmt.Sprintf("there is error in configuration %s, path cannot be empty!", key))
				}
				if home != "" {
					r.StaticFile(fmt.Sprintf("/%s", key), home)
				}
			}

			proxy := webserverconfig["proxy"].(map[string]interface{})

			if proxy != nil {
				go renderproxy(proxy, r, ilog)
			}

			headers := webserverconfig["headers"].(map[string]interface{})
			r.Use(GinMiddleware(headers))

		} else {
			ilog.Error("There is no configuration of webserver!")
			panic("There is no configuration of webserver!")
		}

		// Start the web server
		r.Run(fmt.Sprintf(":%d", port))

	}()
	/*wg.Add(1)
	go func() {
		defer wg.Done()
		hip, err := com.GetHostandIPAddress()

		if err != nil {
			ilog.Error(fmt.Sprintf("Failed to get host and ip address: %v", err))
		}
		if hip == nil {
			ilog.Error("Failed to get host and ip address")

		} else {
			for key, value := range hip {
				nodedata[key] = value
			}
			if hip["Host"] != nil {
				nodedata["healthapi"] = fmt.Sprintf("http://%s:%d/portalhealth", hip["Host"], port)
			}
		}
	}()  */
	// Start the heartbeat
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			HeartBeat(ilog, gconfig)
			time.Sleep(5 * time.Minute)
		}
	}()

	elapsed := time.Since(startTime)
	ilog.PerformanceWithDuration("iac-ui.main", elapsed)
	wg.Wait()
}

// CORSMiddleware is a middleware function that adds Cross-Origin Resource Sharing (CORS) headers to the HTTP response.
// It allows requests from a specified origin and supports various HTTP methods.
// The allowOrigin parameter specifies the allowed origin for CORS requests.
// This middleware function also handles preflight requests by responding with appropriate headers.

func CORSMiddleware(allowOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", allowOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		//  c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, Origin")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, Content-Length, X-CSRF-Token, Token, session, Origin, Host, Connection, Accept-Encoding, Accept-Language, X-Requested-With")

		//	ilog.Debug(fmt.Sprintf("CORSMiddleware: %s", allowOrigin))
		//	ilog.Debug(fmt.Sprintf("CORSMiddleware header: %s", c.Request.Header))
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// GinMiddleware is a middleware function that sets the specified headers in the HTTP response.
// It takes a map of headers as input and returns a gin.HandlerFunc.
// The middleware sets the headers in the response using the values provided in the headers map.
// If the HTTP request method is OPTIONS, it aborts the request with a status code of 204 (No Content).
// After setting the headers, it calls the next handler in the chain.
// The next handler can be a controller function or another middleware function.
// The next handler can also be a gin.HandlerFunc.
func GinMiddleware(headers map[string]interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {

		//	ilog.Debug(fmt.Sprintf("GinMiddleware: %v", headers))
		//	ilog.Debug(fmt.Sprintf("GinMiddleware header: %s", c.Request.Header))

		for key, value := range headers {
			c.Header(key, value.(string))
			//	c.Writer.Header().Set(key, value.(string))
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func customDirector(cfg *AllowUrlConfig, origDirector func(*http.Request)) func(*http.Request) {
	return func(req *http.Request) {
		path := req.URL.Path
		allowed := false

		for _, prefix := range cfg.AllowedPrefixes {
			if strings.HasPrefix(path, "/"+prefix) {
				allowed = true
				break
			}
		}

		if allowed {

		} else {
			origDirector(req)
		}
	}
}

// renderproxy is a function that renders a proxy configuration by creating routes in a gin.Engine instance.
// It takes a map of proxy configurations and a pointer to a gin.Engine as parameters.
// Each key-value pair in the proxy map represents a route path and its corresponding target URL.
// The function iterates over the proxy map and creates a route for each key-value pair in the gin.Engine instance.
// When a request matches a route, the function sets up a reverse proxy to forward the request to the target URL.
// The function also updates the request URL path based on the "path" parameter in the route.
// Note that the ServeHTTP method of the reverse proxy is non-blocking and uses a goroutine under the hood.

func renderproxy(proxy map[string]interface{}, router *gin.Engine, ilog logger.Log) {
	ilog.Debug(fmt.Sprintf("renderproxy: %v", proxy))

	for key, value := range proxy {
		ilog.Debug(fmt.Sprintf("renderproxy key: %s, value: %s", key, value))

		nextURL, _ := url.Parse((value).(string))
		ilog.Debug(fmt.Sprintf("renderproxy nextURL: %v", nextURL))

		router.Any(fmt.Sprintf("/%s/*proxyPath", key), proxyWithPrefix(value.(string), key))
		/*	router.Any(fmt.Sprintf("/%s/*path", key), func(c *gin.Context) {

				ilog.Debug(fmt.Sprintf("renderproxy path: %s, target: %s", c.Request.URL.Path, nextURL))

				proxy := httputil.NewSingleHostReverseProxy(nextURL)

				// Update the headers to allow for SSL redirection
				//	req := c.Request
				//	req.URL.Host = nextURL.Host
				//	req.URL.Scheme = nextURL.Scheme
				//req.Header["X-Forwarded-Host"] = req.Header["Host"]

				c.Request.URL.Path = c.Param("path")

				ilog.Debug(fmt.Sprintf("request: %v", c.Request))
				// Note that ServeHttp is non blocking and uses a go routine under the hood
				proxy.ServeHTTP(c.Writer, c.Request)

			})
		*/
	}
}

func proxyWithPrefix(targetHost string, prefix string) gin.HandlerFunc {
	targetURL, _ := url.Parse(targetHost)
	/*proxy := httputil.NewSingleHostReverseProxy(targetURL)

	director := proxy.Director
	proxy.Director = func(req *http.Request) {
		// Update the request URL to remove the prefix
		req.URL.Path = strings.TrimPrefix(req.URL.Path, prefix)
		director(req)
	}
	proxy.Director = func(req *http.Request) {
		// Update the request URL to include the prefix
		if req.URL.Path == "" {
			req.URL.Path = prefix
		} else {
			req.URL.Path = prefix + req.URL.Path
		}
		director(req)
	} */

	proxy := buildSingleHostProxy(targetURL, false, 5*time.Minute)

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func initializeloger(gconfig *config.GlobalConfig) error {
	if gconfig.LogConfig == nil {
		return fmt.Errorf("log configuration is missing")
	}
	fmt.Printf("log configuration: %v", gconfig.LogConfig)
	logger.Init(gconfig.LogConfig)
	return nil
}

func HeartBeat(ilog logger.Log, gconfig *config.GlobalConfig) {
	ilog.Debug("Start HeartBeat for iac-activemq application with appid: " + nodedata["AppID"].(string))
	appHeartBeatUrl := com.ConverttoString(gconfig.AppServer["url"]) + "/IACComponents/heartbeat"
	ilog.Debug("HeartBeat URL: " + appHeartBeatUrl)

	result, err := CheckServiceStatus(ilog)
	if err != nil {
		ilog.Error(fmt.Sprintf("HeartBeat error: %v", err))
	}

	data := make(map[string]interface{})
	data["Node"] = nodedata
	data["Result"] = result
	data["timestamp"] = time.Now().UTC()
	// send the heartbeat to the server
	headers := make(map[string]string)
	headers["Content-Type"] = "application/json"
	headers["Authorization"] = "apikey " + com.ConverttoString(gconfig.AppServer["apikey"])

	response, err := com.CallWebService(appHeartBeatUrl, "POST", data, headers)

	if err != nil {
		ilog.Error(fmt.Sprintf("HeartBeat error: %v", err))
		return
	}

	ilog.Debug(fmt.Sprintf("HeartBeat post response: %v", response))
}

func CheckServiceStatus(iLog logger.Log) (map[string]interface{}, error) {
	iLog.Debug("Check webserver Status")

	result, err := health.CheckWebServerHealth(nodedata)
	if err != nil {
		iLog.Error(fmt.Sprintf("Check web server Status error: %v", err))
		return nil, err
	}

	return result, nil
}

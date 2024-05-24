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

(function ($) {

  var import_js_imported = [];

  $.extend(true,
    {
      import_js: function (script) {
        var found = false;
        for (var i = 0; i < import_js_imported.length; i++)
          if (import_js_imported[i] == script) {
            found = true;
            break;
          }

        if (found == false) {
          $("head").append('<script type="text/javascript" src="' + script + '"></script>');
          import_js_imported.push(script);
        }
      }
    });

})(jQuery);

(function () {

  var path = '/portal/scripts/'
  $.import_js(path + "jquery-ui.js")
  //	$.import_js(path + "juery-ui.custom.min.js")
  $.import_js(path + "d3.v5.0/d3.min.js")
  $.import_js(path + "Dagre/dagre.min.js")
  $.import_js(path + "flow/lodash.js")
  $.import_js(path + "flow/graphlib.js")
  $.import_js(path + "flow/backbone.js")
  $.import_js(path + "flow/joint.js")
  $.import_js(path + "flow/svg-pan-zoom.js")
  $.import_js(path + "filesave.js")
  $.import_js(path + "jsonmanager.js")
  $.import_js(path + "jstree.js")
  $.import_js(path + "uiform.js")
  $.import_js(path + "uiwebcomponents.js")
  $.import_js(path + "contextmenu/jquery.contextMenu.js")

})()


var UIWorkFlow = UIWorkFlow || {};
(function (UIWorkFlow) {
  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
  UIWorkFlow.generateUUID = generateUUID;
  function safeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, "_");
  }
  UIWorkFlow.safeName = safeName;
  function safeId(id) {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }
  UIWorkFlow.safeId = safeId;
  function safeClass(className) {
    return className.replace(/[^a-zA-Z0-9]/g, "_");
  }
  UIWorkFlow.safeClass = safeClass;
  function replaceAll(target, search, replacement) {
    return target.replace(new RegExp(search, "g"), replacement);
  }
  UIWorkFlow.replaceAll = replaceAll;

})(UIWorkFlow || (UIWorkFlow = {}));


joint.shapes.workflow = {};

var portsIn = {
  position: {
      name: 'top'
  },
  attrs: {
      portBody: {
          magnet: true,
          r: 10,
          cx: 45,
          cy: 0,
          fill: '#023047',
          stroke: '#023047'
      }
  },
  label: {
      position: {
          name: 'in',
          args: { y: 6 } 
      },
      markup: [{
          tagName: 'text',
          selector: 'label',
          className: 'label-text'
      }]
  },
  markup: [{
      tagName: 'circle',
      selector: 'portBody'
  }]
};

var portsOut = {
  position: {
      name: 'bottom'
  },
  attrs: {
      portBody: {
          magnet: true,
          r: 10,
          cx: 45,
          cy: 95,
          fill: '#E6A502',
          stroke:'#023047'
      }
  },
  label: {
      position: {
          name: 'out',
          args: { y: 6 }
      },
      markup: [{
         // Markup
      }]
  },
  markup: [{
      // Markup
  }]
};

// Task template
joint.shapes.workflow.Task = joint.shapes.basic.Rect.extend({
  markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
  defaults: joint.util.deepSupplement({
    type: 'workflow.Task',
    size: { width: 100, height: 50 },
    attrs: {
      'rect': { fill: '#F8F8F8', stroke: 'black', 'stroke-width': 2 },
      'text': { text: 'Task', 'ref-x': 0.5, 'ref-y': 0.5, 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black', 'font-size': 14 }
    }
  }, joint.shapes.basic.Rect.prototype.defaults),
  ports: {
    groups: {
      'in': portsIn,
      'out': portsOut
    }
  }
});

// Event template
joint.shapes.workflow.Event = joint.shapes.basic.Circle.extend({
  markup: '<g class="rotatable"><g class="scalable"><circle/></g><text/></g>',
  defaults: joint.util.deepSupplement({
    type: 'workflow.Event',
    size: { width: 50, height: 50 },
    attrs: {
      'circle': { fill: '#F8F8F8', stroke: 'black', 'stroke-width': 2 },
      'text': { text: 'Event', 'ref-x': 0.5, 'ref-y': 0.5, 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black', 'font-size': 14 },
      
    }
  }, joint.shapes.basic.Circle.prototype.defaults),
  ports: {
    groups: {
      'in': portsIn,
      'out': portsOut
    }
  }
 
});

// Gateway template
joint.shapes.workflow.Gateway = joint.shapes.basic.Path.extend({
  markup: '<g class="rotatable"><g class="scalable"><path/></g><text/></g>',
  defaults: joint.util.deepSupplement({
    type: 'workflow.Gateway',
    size: { width: 100, height: 50 },
    attrs: {
      'path': { d: 'M 30 0 L 60 30 L 30 60 L 0 30 Z', fill: '##FCF3CF', stroke: 'black', 'stroke-width': 2 },
      'text': { text: 'Routing', 'ref-x': 0.5, 'ref-y': -1, 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black', 'font-size': 14 }
    }
  }, joint.shapes.basic.Path.prototype.defaults),
  ports: {
    groups: {
      'in': portsIn,
      'out': portsOut
    }
  }
});

joint.shapes.workflow.Note = joint.dia.Element.define('workflow.Note', {
  markup: '<g class="rotatable"><g class="scalable"><rect/></g><text/></g>',
  defaults: joint.util.deepSupplement({
    type: 'workflow.Note',
    size: { width: 200, height: 100 },
    attrs: {
      'rect': { fill: '#FFFFCC', stroke: 'black', 'stroke-width': 0 },
      'text': { text: 'Note', 'ref-x': 0.5, 'ref-y': 0.5, 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black', 'font-size': 14 }
    }
  }, joint.dia.Element.prototype.defaults),
  ports: {
    groups: {
      'in': portsIn
    }
  }
});

joint.shapes.standard.Link.define('Block.Link', null, {

  hide: function () {
    this.set('hidden', true);
  },

  show: function () {
    this.set('hidden', false);
  },

  isVisible: function () {
    return !this.get('hidden');
  },

  resolveOrientation: function (element) {

    var source = this.get('source');
    var target = this.get('target');
    var result;

    if (source && source.id !== element.id) {
      result = {
        oppositeEnd: source,
        currentEnd: target
      };
    }

    if (target && target.id !== element.id) {
      result = {
        oppositeEnd: target,
        currentEnd: source
      };
    }

    return result;
  }
});
// Sequence Flow template

joint.shapes.workflow.SequenceFlow = joint.dia.Link.define('workflow.SequenceFlow', {
  attrs: {
    line: {
      connection: true,
      stroke: 'black',
      strokeWidth: 2,
      strokeLinejoin: 'round',
      targetMarker: {
        'type': 'path',
        'stroke': 'black',
        'fill': 'black',
        'd': 'M 10 -5 0 0 10 5 z'
      }
    }
  },
  labels: [
    {
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },
        {
          tagName: 'text',
          selector: 'label'
        }
      ],
      attrs: {
        label: {
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontSize: 14,
          fill: 'black',
          refX: '50%',
          refY: '50%',
          refWidth: '100%',
          refHeight: '100%'
        },
        body: {
          ref: 'label',
          refWidth: '120%',
          refHeight: '120%',
          refX: '-10%',
          refY: '-10%',
          fill: '#F8F8F8',
          stroke: 'black',
          strokeWidth: 2,
          rx: 4,
          ry: 4
        }
      }
    }
  ]
});

var WorkFlow = (function () {
  'use strict';

  $.on = (element, event, selector, callback) => {
    if (!element || element == null)
      return;
    if (!callback) {
      callback = selector;
      $.bind(element, event, callback);
    } else {
      $.delegate(element, event, selector, callback);
    }
  };

  $.off = (element, event, handler) => {
    element.removeEventListener(event, handler);
  };

  $.bind = (element, event, callback) => {
    if (!element || element == null)
      return;
    event.split(/\s+/).forEach(function (event) {
      element.addEventListener(event, callback);
    });
  };

  $.delegate = (element, event, selector, callback) => {
    if (!element || element == null)
      return;
    element.addEventListener(event, function (e) {
      const delegatedTarget = e.target.closest(selector);
      if (delegatedTarget) {
        e.delegatedTarget = delegatedTarget;
        callback.call(this, e, delegatedTarget);
      }
    });
  };

  $.closest = (selector, element) => {
    if (!element) return null;

    if (element.matches(selector)) {
      return element;
    }

    return $.closest(selector, element.parentNode);
  };
  $.clearcontent = (element) => {
    element.empty();
  }
  $.attr = (element, attr, value) => {

    if (!element || element == null)
      return;

    if (!value && typeof attr === 'string') {
      return element.getAttribute(attr);
    }

    if (typeof attr === 'object') {
      for (let key in attr) {
        $.attr(element, key, attr[key]);
      }
      return;
    }

    element.setAttribute(attr, value);
  };


  class Block {
    constructor(flow, data, type) {
      this.flow = flow;
      UI.Log(data,data.id)
      if(!data.id)
        data.id = UIWorkFlow.generateUUID();

    //  UI.Log(data,data.id)
      this.id = data.id ;
      this.name = data.name;
      this.data = data;
      this.type = type;
      this.x = data.x;
      this.y = data.y;
      this.width = data.width;
      this.height = data.height;
      this.isresizing = false;
      this.istextediting = false;
    }

    update(data) {
      data = Object.assign({}, this.data, data);
      this.data = data;
      this.name = data.name;
      this.x = data.x;
      this.y = data.y;
      this.width = data.width;
      this.height = data.height;

      this.shape.attr('text/text', this.name);
      
      //this.shape.position(data.x, data.y);
      //this.shape.resize(data.width, data.height);

      for(var i=0;i<this.flow.nodes.length;i++){
        if(this.flow.nodes[i].id == this.id){
          this.flow.nodes[i] = data;
          let path = 'nodes/{"id": "' + this.id + '"}';
          this.flow.FlowJsonObj.updateNodeValue(path, data);
          break;
        }
      }
    }

    updateblockcolor(color) {
      this.data.fill = color;
      this.shape.attr('rect/fill', color);
    //  this.update({ fill: color });
    }

    delete() {
      let that = this
      this.flow.blocklinks.forEach(function (link) {
        if (link.sourceblockid == that.id || link.destblockid == that.id) {
          link.delete();
        }
      });

      this.shape.remove();
      this.flow.blocks = this.flow.blocks.filter(item => item.id != this.id);
      this.flow.nodes = this.flow.nodes.filter(item => item.id != this.id);
      let path = 'nodes/{"id": "' + this.id + '"}';
      this.flow.FlowJsonObj.deleteNode(path);
    }

    resize(width, height) {
      this.shape.resize(width, height);
      this.data.width = width;
      this.data.height = height;
      this.update({ width: width, height: height });
    }

    update_text(text) {
      if(!text || text == null || text == undefined || text == {})
        return;

      if(this.type == 'note'){
        this.update_notes(text);
        return;
      }
      this.data.name = text;
      this.shape.attr('text/text', text);
      this.update({ name: text });
    }
    setevents() {
      let that = this
      this.shape.on('change:position', function (element) {
        let position = element.position();
        that.x = position.x;
        that.y = position.y;
        that.update({ x: position.x, y: position.y });
      });
   /*   this.shape.on('change:size', function (element) {
        let size = element.size();
        that.width = size.width;
        that.height = size.height;
        that.update({ width: size.width, height: size.height });
      });
    */
    }

    removeevents() {
      this.shape.off('change:position');

    }
  }

  class startBlock extends Block {
    constructor(flow, data, type) {
      super(flow, data, type);
      this.build();
      this.setevents();
    }

    build() {
      var start = new joint.shapes.workflow.Event({
        position: { x: this.x ? this.x : 100, y: this.y ? this.y : 100 },
        attrs: {
          size: { width: this.data.width ? this.data.width : 100, height: this.data.height ? this.data.height : 100 },
          circle: { fill: this.data.fill ? this.data.fill : "lightgreen" },
          text: { text: this.name ? this.name : 'Start' }
        },
    /*    ports: {
          items: [{
            group: 'out',
            id: 'out_'+this.id,
            args: { dx: 0, dy: 10 }
          }]
        } */
      });
    //  start.addPort({ group: 'out', id: 'out'+this.id, args: { dx: 50, dy: -10 } });
  /*    start.addPorts([{
        group: 'out',
        id: 'out_'+this.id,
        attrs:{label:{text:'out'}, portBody:{fill:'red', cx:45, cy:45}}
      }])  */
      this.flow.Graph.addCell(start);
      this.shape = start;
    }
    updateblockcolor(color) {
      this.data.fill = color;
      this.shape.attr('circle/fill', color);
    //  this.update({ fill: color });
    }

  }

  class endBlock extends Block {
    constructor(flow, data, type) {
      super(flow, data, type);
      this.build();
      this.setevents();
    }

    build() {
      var end = new joint.shapes.workflow.Event({
        id: this.id,
        position: { x: this.x ? this.x : 100, y: this.y ? this.y : 100 },
        attrs: {
          size: { width: this.data.width ? this.data.width : 100, height: this.data.height ? this.data.height : 100 },
          circle: { fill: this.data.fill ? this.data.fill : "blue" },
          text: { text: this.name ? this.name : 'End' }
        },
    /*    ports: {
          items: [
            {
              group: 'in',
              id: 'in_'+this.id,
              args: { dx: 0, dy: -10 }
            }
          ]
        }  */
      });
   //   end.addPort({ group: 'in', id: 'in'+this.id, args: { dx: 50, dy: -10 } });
      this.flow.Graph.addCell(end);
      this.shape = end;
    }
    updateblockcolor(color) {
      this.data.fill = color;
      this.shape.attr('circle/fill', color);
    //  this.update({ fill: color });
    }

  }

  class taskBlock extends Block {
    constructor(flow, data, type) {
      super(flow, data, type);
      this.build();
      this.setevents();
    }

    build() {
      var task = new joint.shapes.workflow.Task({
        position: { x: this.x ? this.x : 100, y: this.y ? this.y : 100 },
        attrs: {
          size: { width: this.data.width ? this.data.width : 100, height: this.data.height ? this.data.height : 50 },
          rect: { fill: this.data.fill ? this.data.fill : "lightblue" },
          text: { text: this.name ? this.name : 'Task' }
        },
    /*    ports: {
          items: [
            {
              group: 'in',
              id: 'in_'+this.id,
              args: { dx: 50, dy: -10 }
            },{
            group: 'out',
            id: 'out_'+this.id,
            args: { dx: 50, dy: 10 }
          }
          ]
        } */
      });
    //  task.addPort({ group: 'in', id: 'in'+this.id, args: { dx: 50, dy: -10 } });
    //  task.addPort({ group: 'out', id: 'out'+this.id, args: { dx: 50, dy: -10 } });
      this.flow.Graph.addCell(task);
      this.shape = task;
    }


  }

  class gatewayBlock extends Block {
    constructor(flow, data, type) {
      super(flow, data, type);
      this.build();
      this.setevents();
    }

    build() {
      var gateway = new joint.shapes.workflow.Gateway({
        id: this.id,
        position: { x: this.x ? this.x : 100, y: this.y ? this.y : 100 },
        attrs: {
          size: { width: this.data.width ? this.data.width : 100, height: this.data.height ? this.data.height : 50 },
          path: { fill: this.data.fill ? this.data.fill : "#FCF3CF" },
          text: { text: this.name ? this.name : 'Routing' }
        },
    /*    ports: {
          items: [
            {
              group: 'in',
              id: 'in_'+this.id,
              args: { dx: 0, dy: -10 }
            },{
            group: 'out',
            id: 'out_'+this.id,
            args: { dx: 0, dy: 10 }
          }
          ]
        } */
      });
    //  gateway.addPort({ group: 'in', id: 'in'+this.id, args: { dx: 50, dy: -10 } });
    //  gateway.addPort({ group: 'out', id: 'out'+this.id, args: { dx: 50, dy: -10 } });
      this.flow.Graph.addCell(gateway);
      this.shape = gateway;

    }

    updateblockcolor(color) {
      this.data.fill = color;
      this.shape.attr('path/fill', color);
    //  this.update({ fill: color });
    }

  }

  class noteBlock extends Block {
    constructor(flow, data, type) {
      super(flow, data, type);
      this.build();
    }
    build() {
      var note = new joint.shapes.workflow.Note({
        id: this.id,
        position: { x: this.x ? this.x : 100, y: this.y ? this.y : 100 },
        attrs: {
          size: { width: this.data.width ? this.data.width : 200, height: this.data.height ? this.data.height : 100 },
          rect: { fill: this.data.fill ? this.data.fill : "lightblue" },
          text: { text: this.data.notes ? this.data.notes : 'this is notes' }
        },
  /*      ports: {
          items: [
            {
              group: 'in',
              id: 'in_'+this.id,
              args: { dx: 0, dy: -10 }
            }]
        } */
      });
  //    note.addPort({ group: 'in', id: 'in'+this.id, args: { dx: 50, dy: -10 } });
      this.flow.Graph.addCell(note);
      this.shape = note;
    }

    update_notes(notes) {
      this.data.notes = notes;
      this.shape.attr('text/text', notes);
      this.update({ notes: notes });    
    }
  }

  class blockLink {
    constructor(flow, sourceblock, destblock, data) {
      this.flow = flow;
      if(!data || data == null || data == undefined || data == {}){
        data = {
          id: UIWorkFlow.generateUUID(),
          source: sourceblock.id,
          target: destblock.id,
          Label: ''
        }
      }
      
      if(!data.id)
        data.id = UIWorkFlow.generateUUID();
      
      this.id = data.id;
      this.data = data;
      this.sourceblockid = sourceblock.id;
      this.destblockid = destblock.id;

      this.build_link(sourceblock, destblock);
    }

    build_link(sourceblock, destblock) {

      var _link = new joint.shapes.standard.Link({
        source: sourceblock.shape,
        target: destblock.shape 
      });

      _link.appendLabel({
        attrs: {
          text: {
            text: this.data.label ? this.data.label : ''
          }
        }
      })
      this.flow.Graph.addCell(_link);
      this._link = _link;
    }

    update(sourceblock, destblock) {
      this._link.source(sourceblock.shape);
      this._link.target(destblock.shape);
    }
    update_label(label) {
      UI.Log(this, label)

      this.data.label = label;

      this._link.appendLabel({
        attrs: {
          text: {
            text: this.data.label ? this.data.label : ''
          }
        }
      })

      let link = this.flow.links.filter(item => item.id == this.id);
      if (link.length > 0) {
        link[0] = this.data;
      }

      let path = 'links/{"id": "' + this.id + '"}'; 
      this.flow.FlowJsonObj.updateNodeValue(path, this.data);
    }
    delete() {
      this._link.remove();
      this.flow.blocklinks = this.flow.blocklinks.filter(item => item.id != this.id);
      this.flow.links = this.flow.links.filter(item => item.id != this.id);
      let path = 'links/{"id": "' + this.id + '"}';
      this.flow.FlowJsonObj.deleteNode(path);
    }

  }

  class MenuBar{
		constructor(flow, data){
			this.flow = flow;
			this.data = data;
			this.build_menubar();
			this.set_events();
		}
		
		build_menubar(){
			let menubar =  document.createElement('div');
			menubar.classList.add('uiflow_process_flow_menubar_container_menubar');
			
			
			let icon = document.createElement('span');
			icon.classList.add('uiflow_menubar_'+this.data.type);
		//	$(icon).attr('draggable', 'true')
			menubar.appendChild(icon); 
			
			let desc = document.createElement('span');
			desc.classList.add('uiflow_process_flow_menubar_container_menubar_desc')
			menubar.appendChild(desc);
			$(desc).html(this.data.description);
			
			$(menubar).attr('data-key', this.data.datakey);
			$(menubar).attr('title', this.data.description);
		//	$(menubar).attr('draggable', 'true')
			this.flow.menu_panel.appendChild(menubar);
			
			this.menubar = menubar;
		}
		set_events(){
			$.on(this.menubar, 'click', e => {
        $('.uiflow_process_flow_menubar_container_menubar.selected').removeClass("selected")
        this.menubar.classList.add("selected")
				this.flow.menu_click(this.data); 
			})
		}

	}


  class JSONWrapper {
    constructor(json, onChange) {
      this.data = json;
      this.originalvalue = json;
      this.onChange = onChange;
      return new Proxy(this, {
        get(target, property) {
          //UI.Log(target)
          return target.data[property];
        },
        ischanged() {
          return this.originalvalue != this.data;
        },
        set(target, property, value) {
          UI.Log('json change')
          target.data[property] = value;
          target.onChange(property, value);
          return true;
        },
        deleteProperty(target, property) {
          delete target.data[property];
          target.onChange(property, undefined);
          return true;
        }
      });
    }
  }


  class WorkFlow {
    constructor(wrapper, flowobj, options, editable) {
      this.floweditselecteditem = null;
      this.elementresizing = false;
      this.flowobjchange = editable ? editable : true;
      let that = this;

      if (flowobj == "" || flowobj == undefined) {
        flowobj = {}
      }
      this.flowobj = flowobj;

      this.FlowJsonObj = new UI.JSONManager(this.flowobj, { allowChanges: this.flowobjchange })

      if(typeof wrapper == 'string') 
        this.wrapper = document.getElementById(wrapper);
      else
        this.wrapper = wrapper;

      this.wrapperid = this.wrapper.getAttribute('id');

      if(this.wrapperid == null || this.wrapperid == undefined || this.wrapperid == ""){
        this.wrapperid = UIWorkFlow.safeID(UIWorkFlow.generateUUID());
        this.wrapper.setAttribute('id', this.wrapperid);
      }
      this.options = options;
      this.init(wrapper, options);
    }
    init(wrapper, options) {
      window.onresize = null;
      this.svgZoom = null;
      this.Paper = null
      this.Graph = null;
      this.nodes = [];
      this.links = [];
      this.blocks = [];
      this.blocklinks = [];

      $.contextMenu('destroy', '.joint-type-workflow-task, .joint-type-workflow-gateway');
      $.contextMenu('destroy', '.joint-type-workflow-note');
      $.contextMenu('destroy', '.joint-paper');

      this.setup_wrapper(wrapper);
      this.setup_options(options);

      //if(this.options.interactive){
      this.setup_Menubar()
      //}

      this.setup_flow();
      
    }

    setup_options(options) {
      this.toolbars = [];
      const default_options = {
        gridsize: 10,
        drawgrid: true,
        width: 1400,
        height: 1000,
        backgroundcolor: 'white',
        interactive: true,
        nodewidth: 200,
        nodeheight: 100,
        colspace: 80,
        rowspace: 50,
        colmargin: 20,
        rowmargin: 20,
        rankdir: 'TB',
        align: "",
        marginx: 30,
        marginy: 30,
        nodesep: 50,
        ranksep: 50,
        edgesep: 30,
        ranker: "longest-path",
        showtoolbar: true,
        flowtype: 'WORKFLOW',
        skipstartnode: false,
        showlinkmergepoint: true
      };

      this.options = Object.assign({}, default_options, options);
    }
    setup_wrapper(wrapper) {

      //let section = document.getElementById(wrapper)
      let section = this.wrapper
      section.style.display = "flex";
      section.style.flexDirection = "row"
      section.style.flexWrap = "nowrap"
      section.style.width = "100%"
      section.style.height = "100%"
      this.sectionwrapper = this.wrapperid;
    //  this.wrapper = wrapper
      let wrapperid = this.wrapperid;
      let attrs = [{
        'class': 'processflow_container uiflow_process_flow_menubar_container',
        'id': wrapperid + '_flow_menu_panel'
      },
      {
        'class': 'processflow_container',
        'id': wrapperid + "_flow_container",
        'style': 'width:100%;height:100%;display:flex'
      },
      {
        'class': 'processflow_container',
        'id': wrapperid+ '_flow_property_panel',
        'style': 'width:0px;float:right;position:absolute;top:45px;right:0px;background-color:lightgrey;overflow:auto;' +
          'border-left:2px solid #ccc;resize:horizontal;z-index:9'
      },
      {
        'class': 'processflow_items_panel',
        'id': wrapperid + '_flow_items_panel',
        'style': 'width:0px;height:100%;float:left;position:absolute;top:50px;left:0px;background-color:lightgrey;overflow:auto;' +
          'border-left:2px solid #ccc;resize:horizontal;z-index:9'
      }]
      new UI.Builder(section, attrs)
    /*  this.menu_panel = document.getElementById(wrapperid + '_flow_menu_panel')
      this.wrappercontainer = document.getElementById(wrapperid+ "_flow_container")
      this.property_panel = document.getElementById(wrapperid + '_flow_property_panel')
      this.item_panel = document.getElementById(wrapperid + '_flow_items_panel') */
      this.menu_panel = this.wrapper.querySelector('#'+wrapperid + '_flow_menu_panel')
      this.wrappercontainer = this.wrapper.querySelector('#'+wrapperid+ "_flow_container")
      this.property_panel = this.wrapper.querySelector('#'+wrapperid + '_flow_property_panel')
      this.item_panel = this.wrapper.querySelector('#'+wrapperid + '_flow_items_panel')
      this.resizeTool = $('<div class="ui_flow_element_resize-tool"></div>').appendTo('body').hide();
      // Create text input
      this.textInput = $('<input class="ui_flow_element_text-input" type="text">').appendTo('body').hide();

    }

    setup_flow() {
      let that = this;
      if ($(this.wrapper).width() > 800)
        this.options.width = $(this.wrapper).width();
      if ($(this.wrapper).height() > 600)
        this.options.height = $(this.wrapper).height();

      this.setup_workflow_paper();
      this.setup_workflow_graph();
      /*    this.setup_workflow_toolbar();
          this.setup_workflow_property();
          this.setup_workflow_items();  */
      UI.Log(this.flowobj,this)
      this.render();
    }

    setup_workflow_paper() {
      let that = this;
      this.Graph = new joint.dia.Graph;

      this.Paper = new joint.dia.Paper({
        el: this.wrappercontainer, // document.getElementById(wrapper),
        model: this.Graph,
        marginx: this.marginx,
        marginy: this.marginy,
        width: (this.options.width - 45),
        height: this.options.height,
        gridSize: this.options.gridsize,
        drawGrid: this.options.drawgrid,
        interactive: this.options.interactive,
        addLinkFromMagnet: true,
        magnetThreshold: 'onleave',
        background: {
          color: this.options.backgroundcolor
        },
        linkPinning: false,

        defaultConnectionPoint: { name: 'boundary' },
        defaultLink: new joint.shapes.Block.Link({ z: - 1 }),

        markAvailable: true,
        validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {

          /*	if(that.options.flowtype == "FUNCGROUP"){
              return that.validate_functionlink(cellViewS, magnetS, cellViewT, magnetT);
            }else if(that.options.flowtype == "TRANCODE"){
              return that.validate_blocklink(cellViewS, magnetS, cellViewT, magnetT);
            }
            else  
              return false;*/
          return true;

        },
        // Enable link snapping within 20px lookup radius
        snapLinks: { radius: 20 },

        highlighting: {
          'magnetAvailability': {
            name: 'stroke',
            options: {
              padding: 0,
              attrs: {
                'stroke-width': 2,
                'stroke': 'red'
              }
            }
          },
          /* 'elementAvailability': {
              name: 'stroke',
              options: {
                padding: 0,
                attrs: {
                  'stroke-width': 1,
                  'stroke': '#ED6A5A'
                }
              }
            } */
        }
      });

      //	this.Paper.options.highlighting.magnetAvailability = magnetAvailabilityHighlighter;
    }
    setup_workflow_graph() {
      let that = this;
      this.nodes = [];
      this.links = [];
      that.nodes = [];
      that.links = [];
      if (!this.flowobj || this.flowobj == null || this.flowobj == undefined || this.flowobj == {}) {
        return
      }

      if (this.flowobj.nodes) {
        this.flowobj.nodes.forEach(function (node) {
          if (!node.id)
            node.id = UIWorkFlow.generateUUID();
          that.nodes.push(node);
        });
      }
      else {
        this.flowobj.nodes = [];
      }

      if (this.flowobj.links) {
        this.flowobj.links.forEach(function (link) {
          if (!link.id)
            link.id = UIWorkFlow.generateUUID();
          that.links.push(link);
        });
      }else
        this.flowobj.links = [];

    }

    setup_Menubar(){
      let menubars=[];
      menubars.push({
        type: 'Save',
        datakey: 'Save',
        description: 'Save',
        category: 'file'
      })
      menubars.push({
        type: 'Export',
        datakey: 'Export',
        description: 'Export',
        category: 'file'
      })
      menubars.push({
        type: 'Import',
        datakey: 'Import',
        description: 'Import',
        category: 'file'
      })
      menubars.push({
        type: 'select',
        datakey: 'select',
        description: 'select',
        category: 'workflow'
      })
      menubars.push({
        type: 'task',
        datakey: 'task',
        description: 'task',
        category: 'workflow'
      })
      menubars.push({
        type: 'gateway',
        datakey: 'gateway',
        description: 'decision',
        category: 'workflow'
      })
      menubars.push({
        type: 'notes',
        datakey: 'notes',
        description: 'notes',
        category: 'workflow'
      })
      menubars.push({
        type: 'start',
        datakey: 'start',
        description: 'start',
        category: 'workflow'
      })
      menubars.push({
        type: 'end',
        datakey: 'end',
        description: 'end',
        category: 'workflow'
      })
      menubars.push({
        type: 'Back',
        datakey: 'Back',
        description: 'Back',
        category: ''
      })
      this.Menubars = menubars;
    }
    /**
     * Renders the UI workflow.
     */
    render() {
      this.initialize_layout();

      this.make_blocks();
      this.make_links();

      if(this.options.interactive){
        this.make_Menubar();
      }else
        this.menu_panel.style.display ='none';

      this.resize();
      this.setup_zoom();

      if(this.options.interactive){
        this.setup_paperevents();
        this.setup_contextmenu()
      }

      this.trigger_event('flow_ready',[])
    }

    /**
     * Initializes the layout.
     */
    initialize_layout() {
      this.Graph.clear();
      window.onresize = this.resize.bind(this);
    }
    destry() {
      window.onresize = null;
      this.Graph.clear();
      this.Graph.off();
      this.Paper.off();
      this.Paper.remove();
      this.svgZoom = null;
      this.Paper = null
      this.Graph = null;
      this.nodes = [];
      this.links = [];
      this.blocks = [];
      this.blocklinks = [];
      $.contextMenu('destroy', '.joint-type-workflow-task, .joint-type-workflow-gateway');
      $.contextMenu('destroy', '.joint-type-workflow-note');
      $.contextMenu('destroy', '.joint-paper');

    }
    /**
     * Creates blocks based on the nodes in the workflow.
     */
    make_blocks() {
      let that = this;
      this.blocks = [];
      that.blocks = [];
      let blocks = [];
      console.log("make blocks",this.nodes, blocks)
      if (this.nodes) {
        this.nodes.forEach(function (node) {
          if (node.type == "start") {
            let block = new startBlock(that, node, "start");
            blocks.push(block);
          } else if (node.type == "end") {
            let block = new endBlock(that, node, "end");
            blocks.push(block);
          } else if (node.type == "task") {
            let block = new taskBlock(that, node, "task");
            blocks.push(block);
          } else if (node.type == "gateway") {
            let block = new gatewayBlock(that, node, "gateway");
            blocks.push(block);
          } else if (node.type == "note") {
            let block = new gatewayBlock(that, node, "note");
            blocks.push(block);
          }
        });
      }
      console.log("made blocks",blocks, that.flowblocks, that.blocks)
      that.flowblocks = blocks; 
      that.blocks = blocks;
      console.log("made blocks",blocks, that.flowblocks, that.blocks)
    }
    getBlockbyid(blocks,id) {
      let block = null;
    //  UI.Log(this.blocks, id)

      let filtered = blocks.filter(item => item.id == id);
      if (filtered.length > 0)
        block = filtered[0];
      else {
        for (var i = 0; i < blocks.length; i++) {
          if (blocks[i].id == id) {
            block = blocks[i];
            break;
          }
        }
      }
   //   UI.Log(block)
      return block;
    }
    getBlockbyShape(blocks,shape){
      let block = null;
      let filtered = blocks.filter(item => item.shape == shape);
      if (filtered.length > 0)
        block = filtered[0];
      else{
        for(var i=0; i<blocks.length;i++){
          if(blocks[i].shape == shape){
            block = blocks[i];
            break;
          }
        }
      }
      return block;
    }
    getBlockbymodelid(blocks,id) {
      let block = null;
      let that = this
      console.log(id, blocks, that.flowblocks)
      let filtered = that.flowblocks.filter(item => item.shape.id == id);
      if (filtered.length > 0)
        block = filtered[0];
      else{
        for(var i=0; i<that.flowblocks.length;i++){
          if(that.flowblocks[i].shape.id == id){
            block = that.flowblocks[i];
            break;
          }
        }

      }
      return block;
    }
    make_links() {
      let that = this;
      this.blocklinks = [];
      that.blocklinks = [];
      let blocklinks = [];
      if (this.links) {
        this.links.forEach(function (link) {
          let sourceblock = that.getBlockbyid(that.blocks,link.source);
          let destblock = that.getBlockbyid(that.blocks,link.target);
       //   UI.Log(sourceblock, destblock)
          if (sourceblock != null && destblock != null) {
            let blocklink = new blockLink(that, sourceblock, destblock, link);
            blocklinks.push(blocklink);
          }
        });
      }
      this.blocklinks = blocklinks;
    }

    make_Menubar(){

			this.menu_panel.innerHTML ="";
			let that = this;
			this.Menubars.forEach(function(menu){
				return new MenuBar(that, menu);
			})
		}

    add_element(type, evt, x, y) {
      let that = this;
      let node = {
        id: UIWorkFlow.generateUUID(),
        name: type + "",
        type: type,
        x: x,
        y: y,
        width: 100,
        height: 100,
     //   fill: "lightblue"
      }
      let path = 'nodes';
   //   UI.Log(type, evt, x, y)
      if (type == "start") {
        let existingstart = that.blocks.filter(item => item.type == "start");
        if (existingstart.length > 0) {
          UI.ShowError('The start node already exists.');
          return;
        }

        let block = new startBlock(that, node, "start");
        that.blocks.push(block);
        that.nodes.push(node);
        that.FlowJsonObj.addNode(path, node);
      } else if (type == "end") {
        let block = new endBlock(that, node, "end");
        that.blocks.push(block);
        that.nodes.push(node);
        that.FlowJsonObj.addNode(path, node);
      } else if (type == "task") {
        let block = new taskBlock(that, node, "task");
        that.blocks.push(block);
        that.nodes.push(node);
        that.FlowJsonObj.addNode(path, node);
      } else if (type == "gateway") {
        let block = new gatewayBlock(that, node, "gateway");
        that.blocks.push(block);
        that.nodes.push(node);
        that.FlowJsonObj.addNode(path, node);
      } else if (type == "notes") {
        let block = new noteBlock(that, node, "note");
        that.blocks.push(block);
        that.nodes.push(node);
        that.FlowJsonObj.addNode(path, node);
      }
    //  that.render();
      that.floweditselecteditem =null;
      that.elementresizing = false;
      that.resizeTool.hide();
      $(this.wrapper).find('.UIWorkFlow_process_flow_menubar_container_menubar').removeClass('selected');
    }

    setup_paperevents() {
      let paper = this.Paper;
      let that = this;

      paper.on('blank:pointerdown', function (evt, x, y) {
        evt.preventDefault();
        that.elementresizing = false;
        that.resizeTool.hide();
      //  UI.Log('blank:pointerdown', evt, x, y)
        if (that.floweditselecteditem != null) {
          that.add_element(that.floweditselecteditem, evt, x, y);
        }
      });

      paper.on('blank:pointerdblclick', function (evt, x, y) {
      //  evt.preventDefault();
        that.elementresizing = false;
        that.resizeTool.hide();
        that.svgZoom.disablePan();	
        if(that.selectedElement != null){
          joint.dia.HighlighterView.remove(that.selectedElement);
          that.selectedElement = null; 
        }
        that.svgZoom.enablePan();
      });
      
      paper.on('cell:pointerdblclick', function (cellView, evt, x, y) {
      //  evt.preventDefault();
        that.svgZoom.disablePan();
        that.elementresizing = false;	
        
        that.resizeTool.hide();
        if(that.selectedElement != null && that.selectedElement == cellView){
          joint.dia.HighlighterView.remove(that.selectedElement);
          that.selectedElement = null; 
        }
        that.svgZoom.enablePan();
      });
      
      paper.on('cell:pointerdown', function (cellView, evt, x, y) {
        if (cellView.model instanceof joint.dia.Element && that.selectedElement == null) {
          that.selectedElement = cellView;
          
          that.svgZoom.disablePan();          
          joint.highlighters.mask.add(cellView, { selector: 'root' }, 'my-element-highlight', {
            deep: true,
            attrs: {
              'stroke': 'red',
              'stroke-width': 2
            }
          });

          var bbox = cellView.getBBox();
        /*  var x = bbox.x + bbox.width / 2 - 10;
          var y = bbox.y + bbox.height / 2 -10 + 40;
          that.textInput.val(cellView.model.attr('text/text'));
          that.textInput.show();
          that.textInput.focus();
          that.textInput.css({ left: x, top: y });
          */
          if(!that.elementresizing){

            var bottomRightX = bbox.x + bbox.width+ bbox.width/2;
            var bottomRightY = bbox.y + bbox.height +30;
            
            //block.resizing = true;
            //  UI.Log('cell:pointerdown', evt, x, y, bbox, bottomRightX, bottomRightY, block)
            // Start resizing
            that.resizeTool.show();
            that.resizeTool.css({ left: bottomRightX, top: bottomRightY });
            that.elementresizing = true;
          } 

        }else if(cellView.model instanceof joint.dia.Element && that.selectedElement != null && that.selectedElement != cellView){
        //  UI.Log(that, that.selectedElement.model, cellView.model, {})
          let sourceblock = that.getBlockbyShape(that.blocks,that.selectedElement.model);
          let destblock = that.getBlockbyShape(that.blocks,cellView.model);

          if (sourceblock == null || destblock == null){
              UI.ShowError('The link cannot be created. Please check the source and destination blocks.');
              return;
          }

          var existinglink = that.blocklinks.filter(item => item.sourceblockid == sourceblock.id && item.destblockid == destblock.id);
          if (existinglink.length > 0){
            UI.ShowError('The link already exists.');
            return;
          }

          if(sourceblock.type == "end" || destblock.type == "start"){
            UI.ShowError('The link cannot be created. Please check the source and destination blocks.');
            return;
          }

          if(sourceblock.id == destblock.id){
            UI.ShowError('The link cannot be created. Please check the source and destination blocks.');
            return;
          }

          var link = {
            source: sourceblock.id,
            target: destblock.id,
            type: 'link',
            name: 'link',
            id: UIWorkFlow.generateUUID(),
            label: ''
          }
          joint.dia.HighlighterView.remove(that.selectedElement);
          that.selectedElement = null;
          that.elementresizing = false;
          that.resizeTool.hide();

          UI.Log(sourceblock,destblock,link)
          var newLink = new blockLink(that, sourceblock, destblock, link);
          that.links.push(link);
          that.blocklinks.push(newLink);       
          that.FlowJsonObj.addNode('links', link);          
          that.svgZoom.enablePan();
        } 

      });

      that.resizeTool.on('mousedown', function(evt) {
        var bbox = that.selectedElement.getBBox();
        let block = that.getBlockbyShape(that.blocks,that.selectedElement.model);

        block.isresizing = false;
      //  block.istextediting = false;

        that.startSize = { width: bbox.width, height: bbox.height };
        that.startPosition = { x: bbox.x, y: bbox.y };
        var offset = that.resizeTool.offset();

        var startX = evt.clientX - offset.left;
        var startY = evt.clientY - offset.top;
      //  UI.Log('mousedown',evt.clientX, evt.clientY,startX, startY)

        var resizeToolMouseMove = function(evt) {
          var newX = evt.clientX  - startX;
          var newY = evt.clientY- startY;
          var newWidth = newX - bbox.x;
          var newHeight = newY - bbox.y;
          if (newWidth >  30 && newHeight > 30) {

        //  UI.Log('mousemove',newX, newY)
          // Update the position of the resize tool
            that.resizeTool.css({ left: newX, top: newY });

            // Update the size of the element based on the resize tool position
            //var element = that.selectedElement.model;
            //UI.Log("resizing:",element)
          //  element.resize(newWidth, newHeight);
            block.resize(newWidth, newHeight);
          }
        }
        var resizeToolMouseUp = function(evt) {
          // Stop dragging
          block.isresizing = false;
          that.elementresizing = false;
          that.resizeTool.hide();
          
          joint.dia.HighlighterView.remove(that.selectedElement);
          that.selectedElement = null;
          that.svgZoom.enablePan();
          $(document).off('mousemove', resizeToolMouseMove);
          $(document).off('mouseup', resizeToolMouseUp);
        }

        $(document).on('mousemove', resizeToolMouseMove);
        $(document).on('mouseup', resizeToolMouseUp);
      });
      
      that.textInput.on('blur', function() {
        // Update the text of the element
        let block = that.getBlockbyShape(that.blocks,that.selectedElement.model);
        var newText = that.textInput.val();
   ///     var element = that.selectedElement.model;
  //      element.attr('text/text', newText);
        if(block.type == "note")
          block.update_notes(newText);
        else
          block.update_text(newText);
        // Hide the text input
        that.textInput.hide();        
        block.istextediting = false;
      });
      
      paper.on('element:pointermove', function(cellView, evt, x, y) {
        that.resizeTool.hide();
        that.textInput.hide();
      });

      paper.on('link:pointerclick', function(cellView, evt, x, y) {
        evt.preventDefault();
        
        that.textInput.hide();

        var _link = that.blocklinks.filter(item => item._link == cellView.model)
        
        if(_link.length == 0){
          UI.ShowError('The link cannot be found.');
          return;
        }
        // Open a prompt to update the label
        var newLabel = prompt('Enter new label for the link:', cellView.model.label(0).attrs.text.text);

        // Update the label if a new label is provided
        if (newLabel !== null) {
          _link[0].update_label(newLabel);
        //  cellView.model.label(0, { attrs: { text: { text: newLabel } } });
        }
      });

      
      $(window).on('resize', () => that.resize());
    }
    disable_paperevents(){
			this.Paper.model.getCells().forEach(function(cell) {
				cell.interactive = false;
			  });

		}
    resize() {

      let rect = this.Paper.viewport.getBoundingClientRect();

      //	UI.Log(rect, this.options)

      if (rect.width > this.options.width)
        this.Paper.scaleContentToFit({ padding: 20 });


      rect = this.Paper.viewport.getBoundingClientRect();

      if (rect.height > this.options.width)
       $(this.wrapper).css('overflow-y', 'auto')
    }

    setup_zoom() {
      //	UI.Log(this.wrapper,this.container,$(this.container))
      this.svgZoom = svgPanZoom($(this.wrappercontainer).find('svg')[0], {
        center: true,
        zoomEnabled: true,
        panEnabled: true,
        controlIconsEnabled: true,
        fit: false,
        minZoom: 0.05,
        maxZoom: 50,
        zoomScaleSensitivity: 0.1
      });

    }

    menu_click(data){
    //  UI.Log(data)
      let that = this;
      if(that.selectedElement != null){
        joint.dia.HighlighterView.remove(that.selectedElement);
        that.selectedElement = null; 
      }

      if(data.category == "workflow" && data.type != "select"){
        this.floweditselecteditem = data.type;
        $('.UIWorkFlow_process_flow_menubar_container_menubar').removeClass('selected');
        $(this.menu_panel).find('.UIWorkFlow_menubar_'+data.type).parent().addClass('selected');
        return;
      }else{
        this.floweditselecteditem = null;
        $('.UIWorkFlow_process_flow_menubar_container_menubar').removeClass('selected');
      }
      if(data.type == "Save"){
        this.save();
        return;
      }
      if(data.type == "Export"){
        this.export();
        return;
      }
      if(data.type == "Import"){
        this.import();
        return;
      }
    }

    setup_contextmenu() {
      let that = this;
      console.log('setup_contextmenu', that)
      $.contextMenu({
        selector: '.joint-type-standard-link',
        build: function ($triggerElement, e) {
          that.disable_paperevents();
          let modelid = $triggerElement[0].getAttribute('model-id');
          let blocklink = that.blocklinks.filter(item => item._link.id == modelid);
          return {
            callback: function (key, options, e) {
              UI.Log(key, options, e)
              switch (key) {
                case 'Properties':
                  var newLabel = prompt('Enter new label for the link:', blocklink[0].data.Label);
                  if (newLabel !== null && newLabel != "" && newLabel != blocklink[0].data.Label) {
                    blocklink[0].update_label(newLabel);
                  }
                  break;
                case "Delete":
                  if (blocklink.length > 0) {
                    var result = confirm("Are you sure you want to delete?");
                    if (result) {
                      blocklink[0].delete();
                    }
                  }
                  break;
              }

            },
            items: {
              'Properties': {
                name: 'Properties',
                icon: 'fa-cog',
                disabled: false
              },
              'Delete': {
                name: 'Deletee',
                icon: 'fa-minus',
                disabled: false
              },
              "sep1": '------------',
              'Quit': {
                name: 'Quit',
                icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; },
              }
            }

          }
        },
      });

      $.contextMenu({
				selector: '.joint-paper', 
				build:function($triggerElement,e){
					that.disable_paperevents();
					return{
						callback: function(key, options,e){
							UI.Log(key, options,e)
              switch(key){
                case 'Properties':
                  that.setup_flowproperties();
                  UI.Log('Properties')
                  break;
                case "Save":
                  that.save();
                  break;
                case "Export":
                  that.export();
                  break;
                case "Import":
                  that.import();
                  break;
              }
            },
            items:{
              'Properties':{
                name: 'Properties',
                icon: 'fa-cog',
                disabled: false
              },
              'Save':{
                name: 'Save',
                icon: 'fa-save',
                disabled: false
              },
              'Export':{
                name: 'Export',
                icon: 'fa-download',
                disabled: false
              },
              'Import':{
                name: 'Import',
                icon: 'fa-upload',
                disabled: false
              },
              "sep1":'------------',
              'Quit':{
                name: 'Quit',
                icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; },
              }
            }
          }
        }
      });

      $.contextMenu({
				selector: '.joint-type-workflow-task, .joint-type-workflow-gateway', 
				build:function($triggerElement,e){
					that.disable_paperevents();
				//	UI.Log('build the contextmenu:',$triggerElement,e,$triggerElement[0].getAttribute('model-id'))
					let modelid = $triggerElement[0].getAttribute('model-id');
          let block = that.getBlockbymodelid(that.blocks,modelid);
          UI.Log(that.blocks,block, modelid)
					return{
						callback: function(key, options,e){
							UI.Log(key, options,e)
							switch(key){

								case 'Properties':
                  that.setup_blockproperties(block);
                  UI.Log(block, 'Properties')
									break;
								case "Delete":
									var result = confirm("Are you sure you want to delete?");
									if(result){
									//	that.delete_blockline(modelid);

                    block.delete();
									}
									break;
							}

						}, 
						items:{
							'Properties':{
								name: 'Properties',
								icon: 'fa-cog',
								disabled: false
							},
							'Delete':{
								name: 'Deletee',
								icon: 'fa-minus',
								disabled: false
							},
							"sep1":'------------',
							'Quit':{
								name: 'Quit',
								icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; },
							}
						}

					}
				},
								
			});

      $.contextMenu({
        selector: '.joint-type-workflow-start, .joint-type-workflow-end',
        build: function ($triggerElement, e) {
          that.disable_paperevents();
          let modelid = $triggerElement[0].getAttribute('model-id');
          let block = that.getBlockbymodelid(that.blocks,modelid);
          return {
            callback: function (key, options, e) {
              UI.Log(key, options, e)
              switch (key) {
                case "Delete":
                  var result = confirm("Are you sure you want to delete?");
                  if (result) {
                    block.delete();
                  }
                  break;
              }

            },
            items: {
              'Delete': {
                name: 'Deletee',
                icon: 'fa-minus',
                disabled: false
              },
              "sep1": '------------',
              'Quit': {
                name: 'Quit',
                icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; },
              }
            }

          }
        },
      });

      $.contextMenu({
        selector: '.joint-type-workflow-note',
        build: function ($triggerElement, e) {
          that.disable_paperevents();
          let modelid = $triggerElement[0].getAttribute('model-id');
          let block = that.getBlockbymodelid(that.blocks,modelid);
          return {
            callback: function (key, options, e) {
              UI.Log(key, options, e)
              switch (key) {
                case 'Properties':
                  var newLabel = prompt('Enter new notes for the block:',  block.data.notes);
                  if (newLabel !== null && newLabel != "" && newLabel != block.data.notes) {
                    block.update_notes(newLabel);
                  }
                  
                  break;
                case "Delete":
                  var result = confirm("Are you sure you want to delete?");
                  if (result) {
                    block.delete();
                  }
                  break;
              }

            },
            items: {
              'Properties': {
                name: 'Properties',
                icon: 'fa-cog',
                disabled: false
              },
              'Delete': {
                name: 'Deletee',
                icon: 'fa-minus',
                disabled: false
              },
              "sep1": '------------',
              'Quit': {
                name: 'Quit',
                icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; },
              }
            }

          }
        },
      });
    }
    save(){
      UI.Log(this,this.flowobjchange, this.flowobj)
      let newobj  = JSON.parse(JSON.stringify(this.flowobj))
      let links = newobj.links;
      for(let i=0; i<links.length; i++){
        for(let j=0; j<links.length; j++){
          if((i!=j && links[i].source == links[j].source && links[i].target == links[j].target && links[i].id != links[j].id) || links[j].source == links[j].target ){
            links.splice(j,1);
            j--;
          }                  
        }
      }
      this.flowobj.links = links;
      for(let i=0; i<this.flowobj.nodes.length; i++){
        if(this.flowobj.nodes[i].type != "start" || this.flowobj.nodes[i].type != "end"){
          if(this.flowobj.nodes[i].hasOwnProperty('processdata')){
            if(this.flowobj.nodes[i].processdata ==""){
              this.flowobj.nodes[i].processdata = {};
            }else if(typeof this.flowobj.nodes[i].processdata == "string"){
              try{
                this.flowobj.nodes[i].processdata = JSON.parse(this.flowobj.nodes[i].processdata)
              }catch(e){
                this.flowobj.nodes[i].processdata = {};
              }
            }
          }            
        }
        
        if(this.flowobj.nodes[i].hasOwnProperty("precondition"))
          delete this.flowobj.nodes[i].precondition

        if(this.flowobj.nodes[i].hasOwnProperty("postcondition"))
          delete this.flowobj.nodes[i].postcondition

      }

      this.trigger_event('save_flow', [this.flowobj]);
    }
    export(){
      let that = this;
			let flowjson = this.flowobj;
			let blob = new Blob([JSON.stringify(flowjson)], {type: "text/plain;charset=utf-8"});
		//	UI.Log(blob)
			
			let file = new File([blob], this.flowobj.trancodename+'_'+this.flowobj.version+".json", {type: "text/plain;charset=utf-8"});
			
			saveAs(file)

    }
    import(){
      let that = this;
			if(this.flowobjchange){
				let result = confirm("Do you want to save the flow?");

				if(result){
					this.trigger_event("save_flow", [that.flowobj]);
					this.flowobjchange = false;
				}	
			}
			
			let popup = document.createElement('div')
			popup.setAttribute('class','popupContainer')
			popup.setAttribute('id','popupContainer')

			let popupContent = document.createElement('div')
			popupContent.setAttribute('class','popupContent')
			popupContent.setAttribute('id','popupContent')
			popup.appendChild(popupContent)
			let title = document.createElement('h2')
			title.innerHTML = 'Please select file to import'
			title.lngcode="Select_File_To_Import"
			popupContent.appendChild(title)

			let fileInput = document.createElement('input');
			fileInput.type = 'file';
			fileInput.accept = '.json';
			fileInput.addEventListener('change', (event) => {
			  const file = event.target.files[0];
			  that.read_to_import_File(file);
			});	
			popupContent.appendChild(fileInput)

			let closePopupButton = document.createElement('button');
			closePopupButton.setAttribute('id','closePopupButton')
			closePopupButton.innerHTML = 'Close'
			closePopupButton.lngcode="Close"
			closePopupButton.addEventListener('click', () => {
				popup.style.display = 'none';
				$('#popupContainer').remove();
			});
			popupContent.appendChild(closePopupButton)
			document.body.appendChild(popup)
			popup.style.display = 'block';
			UI.translate(popupContent);
    }
    read_to_import_File(){
      const reader = new FileReader();
			let that = this;
  			reader.onload = (event) => {
				const fileContents = event.target.result;
				try {
					const jsonData = JSON.parse(fileContents);
				// Handle the JSON data
					UI.Log(jsonData);
					that.flowobj = jsonData;
					that.FlowJsonObj = new UI.JSONManager(jsonData, {allowChanges: true});
					//let newoptions = that.options					
					that.destry();
					$.contextMenu('destroy', '.joint-paper');									
					that.setup_flow();

					$('#popupContainer').remove();
					
				} catch (error) {
				console.error('Error parsing JSON file:', error);
				}
			};

			reader.readAsText(file);

    }
    setup_flowproperties() {
      let that = this;
      this.property_panel.innerHTML = "";
    /*  let attrs = [ {
        'class': 'processflow_container',
        'id': this.wrapper + '_flow_property_panel_header',
        'style': 'width:100%;height:30px;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9',
        'innerHTML': '<span style="padding:5px;">' + this.flowobj.name + '</span>'
      },
      {
        'class': 'processflow_container',
        'id': this.wrapper + '_flow_property_panel_content',
        'style': 'width:100%;height:100%;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9; padding:5px'
      }]
      new UI.Builder(this.property_panel, attrs)

      let header = document.getElementById(this.wrapper + '_flow_property_panel_header');
      let content = document.getElementById(this.wrapper + '_flow_property_panel_content');*/
      let attrs={
        'class': 'processflow_container',
        'id': this.wrapperid + '_flow_property_panel_content',
        'style': 'width:100%;height:100%;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9; padding:5px'
      }

      let content = (new UI.FormControl(this.property_panel, 'div', attrs)).control;
      
      attrs={  innerHTML: 'UUID', lngcode: 'UUID',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'workflow_UUID', value: that.flowobj.uuid, style:"width:90%;margin:5px"};
      new UI.FormControl(content, 'span',attrs);
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'workflow_name', innerHTML: 'Name', lngcode: 'Name',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});
      
      attrs ={type: 'text', id: 'workflow_name', value: that.flowobj.name, style:"width:90%;margin:5px"};
      let workflowname = new UI.FormControl(content, 'input',attrs);
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'workflow_description', innerHTML: 'Description', lngcode: 'Description',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'workflow_description', innerHTML: that.flowobj.description==undefined?"": that.flowobj.description, style:"width:90%;margin:5px;height:50px"};
      let workflowdescription = new UI.FormControl(content,"textarea", attrs);  
    	new UI.FormControl(content, 'br', {});

      attrs={ for: 'workflow_type', innerHTML: 'Type', lngcode: 'Type',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'workflow_type', value: that.flowobj.type, style:"width:90%;margin:5px"};
      let workflowtype = new UI.FormControl(content, 'input',attrs);
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'workflow_class', innerHTML: 'Class', lngcode: 'Class',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'workflow_class', value: that.flowobj.class, style:"width:90%;margin:5px"};
      let workflowclass = new UI.FormControl(content, 'input',attrs);
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'workflow_version', innerHTML: 'Version', lngcode: 'Version',style:"width:90%;margin:5px"}
      new UI.FormControl(content, 'label', attrs);
      new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'workflow_version', value: that.flowobj.version, style:"width:90%;margin:5px"};
      let workflowversion = new UI.FormControl(content, 'input',attrs);
      new UI.FormControl(content, 'br', {});

      attrs ={
				for: 'workflow_isdefault',
				innerHTML: 'Is Default',
				style:"width:100%",
				lngcode: 'isdefault'
			}
			new UI.FormControl(content,'label',attrs);
			new UI.FormControl(content,'br',{});

			attrs ={
				type: 'checkbox',
				id: 'workflow_isdefault',
				name: 'isdefault',
				value: that.flowobj.isdefault,
				class: 'form-control',
				style:"width:100%"
			}
			let workflowisdefault = new UI.CheckBox(content,'input',attrs);
			new UI.FormControl(content,'br',{});


      attrs={ for: 'workflow_status', innerHTML: 'Status', lngcode: 'Status',style:"width:90%;margin:5px"}
      new UI.FormControl(content, 'label', attrs);
      new UI.FormControl(content, 'br', {});

      attrs ={
				id: 'workflow_status',
				selected: that.flowobj.status || 0,
				attrs:{style:"width:100%", id: 'workflow_status',},
				options: ["Developing", "Prototype", "Testing", "Stage", "Production"]
			}
			let workflowstatus = new UI.Selection(content,attrs);			
      new UI.FormControl(content, 'br', {});

      new UI.FormControl(content, 'hr', {});

      attrs ={id: 'workflow_update', class:"btn btn-primary fa-save",value: "Update", style:"width:40%", innerHTML:'Update'};
      let workflowupdate = ( new UI.FormControl(content,'button', attrs, {})).control;
      workflowupdate.addEventListener('click', function(){
        let name = workflowname.control.value;
        let description = workflowdescription.control.value;
        let type = workflowtype.control.value;
        let classs = workflowclass.control.value;
        let version = workflowversion.control.value;
        let isdefault = workflowisdefault.control.checked;
        let status = workflowstatus.control.value;
                
        that.FlowJsonObj.updateNode('name', name);
        that.FlowJsonObj.updateNode('description', description);
        that.FlowJsonObj.updateNode('type', type);
        that.FlowJsonObj.updateNode('class', classs);
        that.FlowJsonObj.updateNode('version', version);
        that.FlowJsonObj.updateNode('isdefault', isdefault);
        that.FlowJsonObj.updateNode('status', status);

        that.property_panel.style.display =  'none';
      })

      attrs ={id: 'flow_cancel', class:"btn btn-danger fa-close", value: "Close", style:"width:40%", innerHTML:'Close'};
      let blockcancel = ( new UI.FormControl(content,'button', attrs)).control;

      $.on(blockcancel, 'click', e => {
        that.property_panel.style.display =  'none';
      })

      let height = window.clientHeight - 100;
      this.property_panel.style.display = 'block';
      this.property_panel.style.width = '400px';
      this.property_panel.style.height = "auto";
      this.property_panel.style.maxHeight = height +"px";
      this.property_panel.style.overflowX = 'hidden';
      this.property_panel.style.overflowY = 'auto';

    }

    setup_blockproperties(block) {
      let data = block.data;
      UI.Log(block, data)
      let that = this;
      this.property_panel.innerHTML = "";
      /*
      let attrs = [{
        'class': 'processflow_container',
        'id': this.wrapper + '_flow_property_panel_header',
        'style': 'width:100%;height:30px;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9',
        'innerHTML': '<span style="padding:5px;">' + data.name + '</span>'
      },
      {
        'class': 'processflow_container',
        'id': this.wrapper + '_flow_property_panel_content',
        'style': 'width:100%;height:100%;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9; padding:5px'
      }]
      new UI.Builder(this.property_panel, attrs)

      let header = document.getElementById(this.wrapper + '_flow_property_panel_header');
      */
      let attrs={
        'class': 'processflow_container',
        'id': this.wrapperid + '_flow_property_panel_content',
        'style': 'width:100%;height:100%;background-color:lightgrey;overflow:auto;border-left:2px solid #ccc;resize:horizontal;z-index:9; padding:5px'
      }

      let content = (new UI.FormControl(this.property_panel, 'div', attrs)).control;

      attrs={  innerHTML: 'ID', lngcode: 'ID',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'block_id', value: data.id, style:"width:90%;margin:5px"};
      new UI.FormControl(content, 'span',attrs);
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'block_name', innerHTML: 'Name', lngcode: 'Name',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'block_name', value: data.name, style:"width:90%;margin:5px"};
      let blockname = new UI.FormControl(content, 'input',attrs);
      new UI.FormControl(content, 'br', {});
      attrs={ for: 'block_description', innerHTML: 'Description', lngcode: 'Description',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'block_description', innerHTML: data.description==undefined?"": data.description, style:"width:90%;margin:5px;height:50px"};
      let blockdescription = new UI.FormControl(content,"textarea", attrs);  
    	new UI.FormControl(content, 'br', {});

      attrs={ for: 'block_roles', innerHTML: 'Roles', lngcode: 'Roles',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={"class": "iac-ui-multiple-inputs-container", id: "iac-ui-multiple-inputs-container-blockroles", style:"width:90%;margin:5px"};
      let blockrolescontainer = (new UI.FormControl(content, "div", attrs)).control;
      blockrolescontainer.style.display = "-webkit-flex";
      blockrolescontainer.style.webkitFlexDirection = "row";
      blockrolescontainer.style.webkitFlexWrap = "wrap";
      blockrolescontainer.style.webkitAlignItems = "flex-start";
      blockrolescontainer.style.webkitJustifyContent = "flex-start";
      blockrolescontainer.style.flexShrink = "0";
      attrs ={type: 'text', id: 'block_roles', value: "", class:"iac-ui-multiple-inputs-container-inputbox", placeholder:"Enter roles separated by ;", style:"height:30px"}; 
      let blockroles = (new UI.FormControl(blockrolescontainer, "input", attrs)).control;

      blockroles.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            chatboxbutton.click();
        }
        if (event.key === ';' || event.keyCode === 186 || event.keyCode === 59) {
            const inputField = document.getElementById('block_roles');
           // const tokenContainer = document.getElementById('iac-ui-header-notification-chatbox-receipts-token-container');
            const inputValue = inputField.value.trim();
            if (inputValue === '') {
                alert('Please enter a value');
                return;
            }
            const tokens = inputValue.split(';');
            tokens.forEach(token => {
                if(token.trim() != ""){
                    const option = that.createToken(token);                                    
                    blockrolescontainer.appendChild(option);
                }
            });

            inputField.value = '';
        }
      });

      if(data.roles != undefined){
        data.roles.forEach(role => {
          const option = that.createToken(role);                                    
          blockrolescontainer.appendChild(option);
        });
      }

      attrs={ for:'block_users', innerHTML: 'Users', lngcode: 'Users',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={"class": "iac-ui-multiple-inputs-container", id: "iac-ui-multiple-inputs-container-blockusers", style:"width:90%;margin:5px"};
      let blockuserscontainer = (new UI.FormControl(content, "div", attrs)).control;
      blockuserscontainer.style.display = "-webkit-flex";
      blockuserscontainer.style.webkitFlexDirection = "row";
      blockuserscontainer.style.webkitFlexWrap = "wrap";
      blockuserscontainer.style.webkitAlignItems = "flex-start";
      blockuserscontainer.style.webkitJustifyContent = "flex-start";
      blockuserscontainer.style.flexShrink = "0";
      attrs ={type: 'text', id: 'block_users', value: "", class:"iac-ui-multiple-inputs-container-inputbox", placeholder:"Enter roles separated by ;", style:"height:30px"}; 
      let blockusers = (new UI.FormControl(blockuserscontainer, "input", attrs)).control;

      blockusers.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            chatboxbutton.click();
        }
        if (event.key === ';' || event.keyCode === 186 || event.keyCode === 59) {
            const inputField = document.getElementById('block_users');
           // const tokenContainer = document.getElementById('iac-ui-header-notification-chatbox-receipts-token-container');
            const inputValue = inputField.value.trim();
            if (inputValue === '') {
                alert('Please enter a value');
                return;
            }
            const tokens = inputValue.split(';');
            tokens.forEach(token => {
                if(token.trim() != ""){
                    const option = that.createToken(token);                                    
                    blockuserscontainer.appendChild(option);
                }
            });

            inputField.value = '';
        }
      });

      if(data.users != undefined){
        data.users.forEach(user => {
          const option = that.createToken(user);                                    
          blockuserscontainer.appendChild(option);
        });
      }

      new UI.FormControl(content, 'br', {});


      attrs={ for: 'block_page', innerHTML: 'UI Page', lngcode: 'Page',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});
    //  attrs ={type: 'text', id: 'block_page', value: data.page, style:"width:390px;margin:5px"};
    //  let blockpage =  new UI.FormControl(row,"input", attrs);

      let row = (new UI.FormControl(content, 'div',{id:'blockpage_section',style:"display:row;width:100%;display: flex;align-items: center;flex-direction: row;" })).control;
      let inputwidth = 350;
      attrs ={type: 'text', id: 'block_page', value: data.page, style:"width:"+inputwidth+"px;margin:5px"};
      let blockpage =  new UI.FormControl(row,"input", attrs);
      
      let plusevents={"click": function(){
        that.selectEntity("Page")
      }}

      new UI.FormControl(row, 'li', {class: "fa fa-plus",style: 'width: 35px;'}, plusevents)
      new UI.FormControl(content, 'br', {});

      attrs={ for: 'block_trancode', innerHTML: 'Business Logic', lngcode: 'Business Logic',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      row = (new UI.FormControl(content, 'div',{id:'blockpage_section',style:"display:row;width:100%;display: flex;align-items: center;flex-direction: row;" })).control;
      inputwidth = 350;
      attrs ={type: 'text', id: 'block_trancde', value: data.trancode,  style:"width:"+inputwidth+"px;margin:5px"};
      let blocktrancode =  new UI.FormControl(row,"input", attrs);
      
      plusevents={"click": function(){
        that.selectEntity("TranCode")
      }}
      new UI.FormControl(row, 'li', {class: "fa fa-plus",style: 'width: 35px;'}, plusevents)
      
      new UI.FormControl(content, 'br', {});
/*
      attrs={ for: 'block_precondition', innerHTML: 'Pre Condition', lngcode: 'Pre Condition',style:"width:90%;margin:5px"}
			new UI.FormControl(content, 'label', attrs);
			new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'block_precondition', innerHTML: data.precondition==undefined? "": data.precondition, style:"width:90%;margin:5px;height:50px"};
      let blockprecondition =  new UI.FormControl(content,"textarea", attrs);
      new UI.FormControl(content, 'br', {});
*/
      attrs={ for: 'block_processdata', innerHTML: 'Process Data', lngcode: 'Process Data',style:"width:90%;margin:5px"}
      new UI.FormControl(content, 'label', attrs);
      new UI.FormControl(content, 'br', {});
/*
      attrs ={type: 'text', id: 'block_processdata', innerHTML: data.processdata==undefined?"":data.processdata, style:"width:90%;margin:5px;height:50px"};
      let blockprocessdata =  new UI.FormControl(content,"textarea", attrs);
      new UI.FormControl(content, 'br', {});
*/
      let divsection = new UI.FormControl(content, 'div', {style:'width: 100%; display: flex;justify-content: flex-end;', class:"ui-page-actionbar"}).control;
      var processdatatable;
      attrs={class: 'btn btn-primary fa-plus-circle', id: 'pd_addbtn', innerHTML:' Add',lngcode:"Add", style: 'font-family:FontAwesome'}
			let events={click: function(){
					processdatatable.Table.addRow({});
			}}
			new UI.FormControl(divsection, 'button', attrs, events);
				
			attrs={class: 'btn btn-primary fa-minus-circle', id: 'removebtn', innerHTML:'Remove',lngcode:"Remove", style: 'font-family:FontAwesome'};
			events={click: function(){
        let rows = processdatatable.Table.getSelectedRows();
        if(rows.length == 0)
        {
            UI.ShowError('Please select a row to delete');
            return;
        }
        for(var i=0;i<rows.length;i++){
          processdatatable.Table.deleteRow(row[i]);
        }
			}}
			new UI.FormControl(divsection, 'button', attrs, events);
			new UI.FormControl(content, 'br', {});

      processdatatable = (new UI.FormControl(content, 'ui-tabulator', {id: "block_processdatatable", style:"width:90%;margin:5px; height:100px"})).control;

      let tabledata =[];
      let tablecolumns = [ 
          {field:'name', title:'Parameter', width:200, editor: 'input' },
          {field:'value', title:'Value', width: 100, editor: 'input'},
      ];

      if(typeof data.processdata == "string"){
          try{
            data.processdata = JSON.parse(data.processdata);
          }catch(e){
            data.processdata = {};
          }
      }
      if(data.processdata == undefined){
          data.processdata = {};
      }

      if(data.processdata != undefined){

          for(key in data.processdata){
            let value = data.processdata[key];
            tabledata.push({ 
                name:key,
                value:value})
          }
      }

        processdatatable.Table = new Tabulator(processdatatable.uitabulator, {
          height:150,
          selectable:true,
          movableRows:true,								
          layout:"fitColumns",									
          columns:tablecolumns,
          data:tabledata,
        });

/*
      attrs={ for: 'block_postcondition', innerHTML: 'Post Condition', lngcode: 'Post Condition',style:"width:90%;margin:5px"}
      new UI.FormControl(content, 'label', attrs);
      new UI.FormControl(content, 'br', {});

      attrs ={type: 'text', id: 'block_postcondition', innerHTML: data.postcondition==undefined? "": data.postcondition, style:"width:90%;margin:5px; height:50px"};
      let blockpostcondition =  new UI.FormControl(content,"textarea", attrs);
      new UI.FormControl(content, 'br', {});
*/
      var routingtable;
      var targetobjs;
      if(block.type == "gateway"){
        attrs={ for: 'block_routingtable', innerHTML: 'Routing Table', lngcode: 'Routing Table',style:"width:90%;margin:5px"}
        new UI.FormControl(content, 'label', attrs);
        new UI.FormControl(content, 'br', {});
        /*
        attrs ={type: 'text', id: 'block_routingtable', innerHTML: data.routingtablew==undefined? "": data.routingtablew, style:"width:90%;margin:5px; height:50px"};
        let routingtable =  new UI.FormControl(content,"textarea", attrs);
        new UI.FormControl(content, 'br', {});
        */
        let divsection = new UI.FormControl(content, 'div', {style:'width: 100%; display: flex;justify-content: flex-end;', class:"ui-page-actionbar"}).control;
        targetobjs = this.getblocktargets(block);
        let paramenterobj = processdatatable.Table.getData();
        let parameters = [];
        for(var i=0;i<paramenterobj.length;i++){
          parameters.push(paramenterobj[i].name);
        }

				attrs={class: 'btn btn-primary fa-plus-circle', id: 'addbtn', innerHTML:' Add',lngcode:"Add", style: 'font-family:FontAwesome'}
				let events={click: function(){
					routingtable.Table.addRow({});
				}}
				new UI.FormControl(divsection, 'button', attrs, events);
				
				attrs={class: 'btn btn-primary fa-minus-circle', id: 'removebtn', innerHTML:'Remove',lngcode:"Remove", style: 'font-family:FontAwesome'};
				events={click: function(){
          let rows = routingtable.Table.getSelectedRows();
          if(rows.length == 0)
          {
            UI.ShowError('Please select a row to delete');
            return;
          }
          for(var i=0;i<rows.length;i++){
            routingtable.Table.deleteRow(row[i]);
          }
				}}
				new UI.FormControl(divsection, 'button', attrs, events);
				new UI.FormControl(content, 'br', {});

        routingtable = (new UI.FormControl(content, 'ui-tabulator', {id: "block_routingtable", style:"width:90%;margin:5px; height:100px"})).control;

        let tabledata =[];
        let tablecolumns = [{field:'sequence', title:'Seq', width:35, editor: 'input'}, 
          {field:'data', title:'Parameter', width:120, editor: 'liinputst'},
          {field:'value', title:'Value', width: 100, editor: 'input'},
          {field:'target', title:'Target', editor: 'list', editorParams:{values: targetobjs.namelist}},
        ];

        if(typeof data.routingtables == "string"){
          try{
            data.routingtables = JSON.parse(data.routingtables);
          }catch(e){
            data.routingtables = [];
          }
        }
        if(data.routingtables == undefined){
          data.routingtables = [];
        }

        if(data.routingtables != undefined && data.routingtables.length > 0){

          for(var i=0;i<data.routingtables.length;i++){
            let routingtable = data.routingtables[i];
            let targetname = this.getBlockbyid(that.blocks,routingtable.target).data.name;
            tabledata.push({sequence:routingtable.sequence, 
                data:routingtable.data,
                value:routingtable.value,
                target:targetname})
          }
        }
        routingtable.Table = new Tabulator(routingtable.uitabulator, {
          height:150,
          selectable:true,
          movableRows:true,								
          layout:"fitColumns",									
          columns:tablecolumns,
          data:tabledata,
        });

      }
      attrs ={id: 'block_update', class:"btn btn-primary fa-save",value: "Update", style:"width:40%", innerHTML:'Update'};
      let blockupdate = ( new UI.FormControl(content,'button', attrs, {})).control;

      $.on(blockupdate, 'click', e => {
        let roles = blockroles.value.split(';');
        let roletokens = $("#iac-ui-multiple-inputs-container-blockroles").find('.iac-ui-multiple-inputs-token-value')
        UI.Log(roletokens)
        for(var i=0;i<roletokens.length;i++){
          if(roletokens[i].textContent.trim() != "")
            roles.push(roletokens[i].textContent)
        }

        let users = blockusers.value.split(';');
        let usertokens = $("#iac-ui-multiple-inputs-container-blockusers").find('.iac-ui-multiple-inputs-token-value')
        UI.Log(usertokens)
        for(var i=0;i<usertokens.length;i++){
          if(usertokens[i].textContent.trim() != "")
            users.push(usertokens[i].textContent)
        }

        let routingtabledata = [];
        if(block.type == "gateway"){
        //  routingtable = document.getElementById('block_routingtable').value;
          routingtabledata = routingtable.Table.getData();
          for(var i=0;i<routingtabledata.length;i++){
            let routingtablerow = routingtabledata[i];
            routingtabledata[i].sequence = parseInt(routingtabledata[i].sequence)
            for(var j=0;j<targetobjs.namelist.length;j++){
              if(targetobjs.namelist[j] == routingtablerow.target){
                routingtabledata[i].target = targetobjs.idlist[j];
                break;
              }
            }
            
          }

        }
        let processdata = {};
        let items = processdatatable.Table.getData()
        for(var i=0; i<items.length;i++){
          let item = items[i]
          processdata[item.name] = item.value 
        }

        let data = {
          name: blockname.control.value,
          description: blockdescription.control.value,
          roles: roles,
          users: users,
          page: blockpage.control.value,
          trancode: blocktrancode.control.value,
       //   precondition: blockprecondition.control.value,
          processdata: processdata,
       //   postcondition: blockpostcondition.control.value
        }
        if(block.type == "gateway"){
          data.routingtables = routingtabledata;
        }
        block.update(data);
      //  that.render();
        this.property_panel.style.display =  'none';
      })
      
      attrs ={id: 'block_cancel', class:"btn btn-danger fa-close",value: "Close", style:"width:40%", innerHTML:'Close'};
      let blockcancel = ( new UI.FormControl(content,'button', attrs)).control;

      $.on(blockcancel, 'click', e => {
        this.property_panel.style.display =  'none';
      })

      let height = (window.clientHeight || window.innerHeight)- 50;
      this.property_panel.style.display = 'block';
      this.property_panel.style.width = '400px';
      this.property_panel.style.height = height + "px";
     // this.property_panel.style.maxHeight = height +"px";
      this.property_panel.style.overflowX = 'hidden';
      this.property_panel.style.overflowY = 'auto';
    }
    
    createToken(value){
      const tokenContainer = document.createElement('div');
      tokenContainer.className = 'iac-ui-multiple-inputs-token';

      const tokenValue = document.createElement('span');
      tokenValue.className = 'iac-ui-multiple-inputs-token-value';
      tokenValue.textContent = value;

      const removeToken = document.createElement('span');
      removeToken.className = 'iac-ui-multiple-inputs-remove-token';
      removeToken.innerHTML = '&#10006;'; // Cross symbol
      removeToken.onclick = function () {
          tokenContainer.remove();
      };

      tokenContainer.appendChild(tokenValue);
      tokenContainer.appendChild(removeToken);

      return tokenContainer;
    }
    getblocktargets(block){
      let targets = [];
      let targetnames = [];      
      
      for(var i=0;i<this.links.length;i++){
        if(this.links[i].source == block.id){
        
          let link = this.links[i];
          let target =link.target;
          let targetblock = this.getBlockbyid(that.blocks,target);
          targets.push(target);
          targetnames.push(targetblock.data.name);
        }
      }
      UI.Log(block, targets, targetnames)
      return {
        idlist: targets,
        namelist: targetnames
      }
    
    }
    selectEntity(entity){
      let collectionname = "";
      let keyfieldname="";
      let field = "";
      let schema = "";
      if(entity == "Page"){
        collectionname = "UI_Page";
        keyfieldname = "name";
        field = $('#block_page')
        schema = "uipage"
      }
      else if(entity == "TranCode"){
        collectionname = "Transaction_Code";
        keyfieldname = "trancodename";
        field = $('#block_trancode')
        schema = "trancode"
      }
      else {
        UI.ShowError("Not support entity type:"+entity);
        return;
      }

      let cfg = {
      //  "file":"templates/datalist.html", 
        "name": "Data List", 
        "type": "document", 
        "actions": {
            "SELECT":{"type": "script", "next": "","page":"","panels":[], "script": "selectitem"},
            "CANCEL":{"type": "script", "next": "","page":"","panels":[], "script": "cancelitem"},
        }
      }
      let page =Session.CurrentPage;
      UI.Log(page)
      let org_schema = Session.snapshoot.sessionData.ui_dataschema
      let org_entity = Session.snapshoot.sessionData.entity
      let org_selectedKey = Session.snapshoot.sessionData.selectedKey

      let inputs = {}
      inputs.ui_dataschema = schema
    //    UI.Log(inputs)
      cfg.inputs = inputs;
      cfg.onloadedscript = function(){        
      //  $('#-ui-page-popup-panel .ui_actions_section button[value="Cancel"]').hide()
        $('#-ui-page-popup-panel .ui_actions_section button[value="Add"]').hide();
        $('#-ui-page-popup-panel .ui_actions_section button[value="Delete"]').hide();
        $('#-ui-page-popup-panel .ui_actions_section button[value="Revision"]').hide();
      }
      cfg.actions.SELECT.script = function(data){
        let table = $('#-ui-page-popup-panel ui-tabulator')[0];
        let selectedrows = table.Table.getSelectedRows();
        
        console.log("selected data:",selectedrows)
        
        if(selectedrows.length != 1){
          UI.ShowError("Please select one record");
          return;
        }
        let keyvalue = (selectedrows[0].getData())[keyfieldname];

        if(keyvalue ==""){
          UI.ShowError("Selected record has no key value");
          return;
        }

        UI.Log(keyvalue)
        field.val(keyvalue);
        Session.snapshoot.sessionData.ui_dataschema = org_schema;
        Session.snapshoot.sessionData.selectedKey = org_selectedKey;
        page.popupClose();              
      }
      cfg.actions.CANCEL.script = function(data){
        UI.Log("execute the action:", data)
        Session.snapshoot.sessionData.selectedKey = org_selectedKey;
        Session.snapshoot.sessionData.ui_dataschema = org_schema;
        page.popupClose();
      }
      Session.snapshoot.sessionData.ui_dataschema = schema
      //UI.Log(cfg)
      //new UI.View(panel,cfg) 
      page.popupOpen(cfg);

      page.popup.onClose(function(){
          Session.snapshoot.sessionData.selectedKey = org_selectedKey;
          Session.snapshoot.sessionData.ui_dataschema = org_schema;
      })


    }

    trigger_event(event, args) {
      if (this.options['on_' + event]) {
        this.options['on_' + event].apply(null, args);
      }
    }

  }

  return WorkFlow
}());
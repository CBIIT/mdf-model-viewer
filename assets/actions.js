
$( function () {
    var model = L.map('model', {
    crs: L.CRS.Simple,
    minZoom: -3,
    zoomSnap: 1,
    bounceAtZoomLimits: true,
  });
  let BB = $("#graph").find('svg').children('g').get(0).getBBox();
  var bounds = svg_to_leaflet_coords(BB,BB).bounds // [[BB.y,BB.width+BB.x],[BB.height+BB.y,BB.x]]
  model.fitBounds(bounds)
  var image = L.svgOverlay($("#graph").find('svg').get(0), bounds).addTo(model)

  let nb = setup_node_select(model,BB)

  $("#node_select").find('option[value=case]').attr("selected",true)
  model.flyToBounds(nb.case.bounds)
})

function setup_node_select(model,BB) {
  let nb = get_node_bounds(BB);
  Object.keys(nb).sort()
    .forEach( function (item) {
      $("#node_select")
	.append($('<option value="'+item+'">'+item+'</option>'))
      L.rectangle(nb[item].bounds, {color: "purple"}).addTo(model);
    })
  $("#node_select")
    .change( function () {
      model.flyToBounds(nb[$("#node_select").get(0).value].bounds)
    })
  let els = set_node_tooltip_text(BB);
  Object.keys(els).sort()
    .forEach( function (nodename) {
      Object.keys(els[nodename]).sort()
        .forEach( function (propname) {
          L.rectangle(els[nodename][propname].bounds, {color: "red"}).addTo(model).bindTooltip(els[nodename][propname].txt).addTo(model);
        })
    })
	//console.log('b \n');
  return nb
}

function get_node_bounds(BB) {
  let ret={}

  $('svg').find('.node')
    .each( function () {
      txt = $(this).find('title').text()
      let bb = bbox_from_path(this)
      ret[$(this).find('title').text().trim()]= svg_to_leaflet_coords(bb, BB)
    })
  return ret
}

function set_node_tooltip_text(BB) {
  let ret = {}
  $('svg').find('.node')
    .each( function() {
      let nodename = $(this).find('title').text()
      ret[nodename] = {}
      $(this).children('text')
	.each( function() {
          let propname = $(this).text()
          propname = propname.trim()
          if (!propname) {
            // no text here, ignore
            return
          }
          let bb = bbox_from_text(this)
          let bb_leaf = svg_to_leaflet_coords( bb, BB )
          bb_leaf.txt = propname
          ret[nodename][propname] = bb_leaf
	})
    })
  console.log(ret)
  return ret
}

function bbox_from_path(elt) {
  let a = $(elt).find('path').attr('d').split(/[MC ]/);
  a.splice(0,4)
  let b={}
  for ( let i=0 ; i<a.length ; i=i+3 ) {
    let w = a[i].split(',').map( x => Number(x) ) ;
    b.xmax = (i==0) ? w[0]: Math.max(b.xmax,w[0]);
    b.xmin = (i==0) ? w[0] : Math.min(b.xmin, w[0]);
    b.ymax = (i==0) ? w[1] : Math.max(b.ymax,w[1]) ;
    b.ymin = (i==0) ? w[1] : Math.min(b.ymin,w[1]) ;
  }
  b.width = b.xmax - b.xmin ; b.height = b.ymax-b.ymin ;
  b.x = b.xmin ; b.y = b.ymin ; 
  return b
}

function bbox_from_text(elt) {
  let cx = $(elt).attr('x')
  let cy = $(elt).attr('y')
  let b = {}
  // hard-code a small area around center point
  b.width = 100
  b.height = 25
  b.x = cx - b.width/2
  b.y = cy - b.height/2
  return b
}

function svg_to_leaflet_coords (bb, BB) {
  // bb - bounding box to convert
  // BB - document bounding box
  let X = BB.width+BB.x // furthest right (svg coords)
  let Y = BB.y // furthest down (svg coords)
  return { bounds:[ [Y-bb.y, bb.x],
                    [Y-bb.y-bb.height,bb.x+bb.width] ],
	   rect: [ [Y-bb.y,bb.x], [Y-bb.y,bb.x+bb.width],
		   [Y-bb.y-bb.height,bb.x+bb.width],
		   [Y-bb.y-bb.height,bb.x] ] }
}

/*function bbox_from_polyline(elt) {
  
  let b={}
  count = 0
  $(elt).find('polyline')
		.each( function() {
			a = $(this).attr('points')
			b.xmax = (count==0) ? w[0]: Math.max(b.xmax,w[0]);
			b.xmin = (count==0) ? w[0] : Math.min(b.xmin, w[0]);
			b.ymax = (count==0) ? w[1] : Math.max(b.ymax,w[1]) ;
			b.ymin = (count==0) ? w[1] : Math.min(b.ymin,w[1]) ;
			count++;
		})
  for ( let i=0 ; i<a.length ; i=i+3 ) {
    let w = a[i].split(',').map( x => Number(x) ) ;
    
  }
  b.width = b.xmax - b.xmin ; b.height = b.ymax-b.ymin ;
  b.x = b.xmin ; b.y = b.ymin ; 
  return b
}*/


// Tooltips Initialization, borrowed from https://mdbootstrap.com/docs/jquery/javascript/tooltips/
//$(function () {
//  $('[data-toggle="tooltip"]').tooltip()
//})  

$( function () {
  var model = L.map('model', {
    crs: L.CRS.Simple,
    minZoom: -3,
    zoomSnap: 1,
    bounceAtZoomLimits: true,
  });
  let BB = $("#graph").find('svg').children('g').get(0).getBBox();
  let nb = setup_node_select(model,BB.width+BB.x,BB.y)
  var bounds = [[BB.y,BB.width+BB.x],[BB.height+BB.y,BB.x]]
  var image = L.svgOverlay($("#graph").find('svg').get(0), bounds).addTo(model)
  model.fitBounds(bounds)
  // L.polygon(nb.adverse_event.rect,{color: 'lightblue'}).addTo(model)
  $("#node_select").find('option[value=case]').attr("selected",true)
  model.flyToBounds(nb.case.bounds)
})
function setup_node_select(model,X,Y) {
  let nb = get_node_bounds(X,Y);
  Object.keys(nb).sort()
    .forEach( function (item) {
      $("#node_select")
	.append($('<option value="'+item+'">'+item+'</option>'))
	//L.rectangle(nb[item].bounds).bindTooltip(nb[item].txt).addTo(model);
	//
	//
    })
  $("#node_select")
    .change( function () {
      model.flyToBounds(nb[$("#node_select").get(0).value].bounds)
    })
	//console.log('a \n');
	let els = set_node_tooltip_text(X, Y);
	Object.keys(els).sort()
    .forEach( function (item) {
	L.rectangle(els[item].bounds).bindTooltip(els[item].txt).addTo(model);
	//
	//
    })
	//console.log('b \n');
  return nb
}
function get_node_bounds(X,Y) {
  let ret={}
  $('svg').find('.node')
    .each( function () {
	  txt = $(this).find('title').text()
	  //console.log('%s \n', txt);
      // let bb =this.getBBox()
      let bb = bbox_from_path(this)
      ret[$(this).find('title').text().trim()]={ bounds:[ [Y-bb.y, bb.x], [Y-bb.y-bb.height,bb.x+bb.width] ],
					  rect: [ [Y-bb.y,bb.x], [Y-bb.y,bb.x+bb.width],
						  [Y-bb.y-bb.height,bb.x+bb.width],
						  [Y-bb.y-bb.height,bb.x] ],
						  txt}
		console.log(Y-bb.y, bb.x, Y-bb.y-bb.height, bb.x+bb.width);
		var htmlRect = (this).getBoundingClientRect();
		console.log(htmlRect.top, htmlRect.right, htmlRect.bottom, htmlRect.left);
		console.log ('%s \n', txt);
    })
  return ret
}

function set_node_tooltip_text(X, Y) {
	let ret = {}
	var bodyRect = document.body.getBoundingClientRect();
	console.log(bodyRect.top, bodyRect.right, bodyRect.bottom, bodyRect.left);
	//console.log('c \n');
	$('svg').find('.node')
	.each( function() {
		//console.log('d \n');
		let bb = bbox_from_path(this)
		var htmlRect = (this).getBoundingClientRect();
		topOffset = (Y-bb.y)-htmlRect.top
		rightOffset = (bb.x+bb.width)-htmlRect.right
		leftOffset = (bb.x) - htmlRect.left
		bottomOffset = (Y-bb.y-bb.height)-htmlRect.bottom
		XOffset = (rightOffset + leftOffset)/2
		YOffset = (topOffset+bottomOffset)/2
		console.log(htmlRect.top, htmlRect.right, htmlRect.bottom, htmlRect.left);
		$(this).find('text')
		.each( function() {
			var rect = (this).getBoundingClientRect();
			console.log(YOffset+rect.top, XOffset+rect.right, YOffset+rect.bottom, XOffset+rect.left);
			height = rect.height/2
			width = rect.width/2
			txt= $(this).text().trim()
			ret[txt] = { bounds:[ [YOffset+rect.y + height, XOffset+rect.x-width], [YOffset+rect.y-height, XOffset+rect.x+width] ],
						  txt}
			console.log('%s \n', txt);
			//return x.trim()
		//ret.push(x) 
	}) })
	return ret
}

function bbox_from_path(elt) {
  a = $(elt).find('path').attr('d').split(/[MC ]/);
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

// Tooltips Initialization, borrowed from https://mdbootstrap.com/docs/jquery/javascript/tooltips/
//$(function () {
//  $('[data-toggle="tooltip"]').tooltip()
//})  

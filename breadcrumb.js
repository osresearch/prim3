/*
 * Leave a trail of breadcrumbs, following the target.
 */
AFRAME.registerComponent('breadcrumb', {
	schema: {
		target: {type:'selector', default:'#camera', },
		step: {type:'number', default:0.5, },
		radius: {type:'number', default:0.05, },
	},

	init: function()
	{
		this.last = new THREE.Vector3(0,0,0)
		this.dist = new THREE.Vector3(0,0,0)
	},

	tick: function(time, timeDelta)
	{
		var pos = this.data.target.object3D.position;
		var delta = pos.distanceTo(this.last)
		if (delta < this.data.step)
			return;

		this.last.copy(pos)

		// add a new breadcrumb
		var rot = this.data.target.getAttribute('rotation');
		console.log(pos, rot)

		var obj = document.createElement('a-sphere');
		obj.setAttribute('position', {
			x: pos.x,
			y: pos.y,
			z: pos.z,
		});

		obj.setAttribute('radius', this.data.radius);

		obj.setAttribute('material', {
			color: new THREE.Color(
				(rot.x + 180) / 360,
				(rot.y + 90) / 180,
				(rot.z + 180) / 360,
			),
		});

		this.el.appendChild(obj);
	},
});

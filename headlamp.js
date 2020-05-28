/*
 * Keep a lamp aligned with the camera
 */
AFRAME.registerComponent('headlamp', {
	schema: {
		target: {type:'selector', default:'#camera', },
	},

	init: function()
	{
		this.last = new THREE.Vector3(0,0,0)
		this.dist = new THREE.Vector3(0,0,0)
	},

	tick: function(time, timeDelta)
	{
		var pos = this.data.target.getAttribute('position');
		var rot = this.data.target.getAttribute('rotation');

		this.el.setAttribute('position', {
			x: pos.x,
			y: pos.y,
			z: pos.z,
		});

		this.el.setAttribute('rotation', {
			x: rot.x,
			y: rot.y,
			z: rot.z,
		});
	},
});

// from https://stemkoski.github.io/A-Frame-Examples/
AFRAME.registerComponent('extended-wasd-controls', {

	schema: 
	{
		/*
			Default key assignments: WASDQERFTG. 
			(Pronounced: "wahz-dee-kerf-tig")

			WASD: standard forward/left/backward/right movement
			Mnemonics:
			QE: turn left/right (positioned above move left/right keys)
			RF: move up/down ("R"ise / "F"all)
			TG: look up/down (look at "T"ower / "G"round.
		*/
		moveForwardKey:  {type: 'string', default: "W"},
		moveBackwardKey: {type: 'string', default: "S"},
		moveLeftKey:     {type: 'string', default: "A"},
		moveRightKey:    {type: 'string', default: "D"},
		moveUpKey:       {type: 'string', default: "R"},
		moveDownKey:     {type: 'string', default: "F"},
		turnLeftKey:     {type: 'string', default: "Q"},
		turnRightKey:    {type: 'string', default: "E"},
		lookUpKey:       {type: 'string', default: "T"},
		lookDownKey:     {type: 'string', default: "G"},
		
  		flyEnabled:  {type: 'boolean', default: true},
  		turnEnabled: {type: 'boolean', default: true},
  		lookEnabled: {type: 'boolean', default: true},

  		// if you are attaching extended-wasd-controls to a camera
  		//   that also has the look-controls component,
  		//   set this to true to use look-controls from rotation to calculate forward/right vectors.
  		// For responsive magic window effect on tablets, set turnEnabled/lookEnabled to false also.
  		coordinateLookControls: {type: 'boolean', default: false},

  		// consider setting to maxLook to false when working with look controls;
  		//   complicated to handle the combination accurately
  		maxLookEnabled: {type: 'boolean', default: true},
  		maxLookAngle: {type: 'number', default: 60},

  		moveSpeed: {type: 'number', default: 1},  // A-Frame units/second
		turnSpeed: {type: 'number', default: 30}, // degrees/second
		lookSpeed: {type: 'number', default: 30}  // degrees/second
	},

	convertKeyName: function(keyName)
	{
		if (keyName == " ")
			return "Space";
		else if (keyName.length == 1)
			return keyName.toUpperCase();
		else
			return keyName;
	},

	registerKeyDown: function(keyName)
	{
		// avoid adding duplicates of keys
		if ( !this.keyPressedSet.has(keyName) )
        	this.keyPressedSet.add(keyName);
	},

	registerKeyUp: function(keyName)
	{
       	this.keyPressedSet.delete(keyName);
	},

	isKeyPressed: function(keyName)
	{
       	return this.keyPressedSet.has(keyName);
	},

	init: function()
	{
		// register key down/up events 
		//  and keep track of all keys currently pressed
		this.keyPressedSet = new Set();
				
		let self = this;
		
		document.addEventListener( "keydown", 
			function(eventData) 
			{ 
				self.registerKeyDown( self.convertKeyName(eventData.key) );
			}
		);
		
		document.addEventListener( "keyup", 
			function(eventData) 
			{ 
				self.registerKeyUp( self.convertKeyName(eventData.key) );
			} 
		);

		// movement-related data

		this.fore = new THREE.Vector3(0,0,0);
		this.side = new THREE.Vector3(0,0,0);
		this.up = new THREE.Vector3(0,0,0);
		this.direction = new THREE.Vector3(0,0,0);
		
		this.lookControls = null;

		if (this.data.coordinateLookControls)
		{
			this.lookControls = this.el.components["look-controls"];
		}
	},
	

	tick: function (time, timeDelta) 
	{
		// console.log( this.keyPressedSet );

		let moveAmount = (timeDelta/1000) * this.data.moveSpeed;
		// need to convert angle measures from degrees to radians
		let turnAmount = (timeDelta/1000) * THREE.Math.degToRad(this.data.turnSpeed);
		let lookAmount = (timeDelta/1000) * THREE.Math.degToRad(this.data.lookSpeed);
		let maxLookAngle = THREE.Math.degToRad(this.data.maxLookAngle);
		
		// get the real world orientation and position
		//this.el.object3D.getWorldPosition(this.pos)
		
		// reset values
		let totalTurnAngle = 0;
		let totalLookAngle = 0;

		let look_x = 0;
		let look_y = 0;
		let camera = this.el.object3D;

		if ( this.data.lookEnabled )
		{
			if (this.isKeyPressed(this.data.lookUpKey))
				look_x = +lookAmount;

			if (this.isKeyPressed(this.data.lookDownKey))
				look_x = -lookAmount;
		}

		if (this.data.turnEnabled)
		{
			if (this.isKeyPressed(this.data.turnLeftKey))
				look_y = +turnAmount;

			if (this.isKeyPressed(this.data.turnRightKey))
				look_y = -turnAmount;
		}

		// this rotates the camera about its local axis
		camera.rotateX(look_x);
		camera.rotateY(look_y);

		// translate along the camera
		camera.matrix.extractBasis(
			this.side,
			this.up,
			this.fore,
		);

		this.direction.set(0,0,0)

		if (this.isKeyPressed(this.data.moveForwardKey))
			this.direction.sub(this.fore);
		if (this.isKeyPressed(this.data.moveBackwardKey))
			this.direction.add(this.fore);

		if (this.isKeyPressed(this.data.moveRightKey))
			this.direction.add(this.side);
		if (this.isKeyPressed(this.data.moveLeftKey))
			this.direction.sub(this.side);

		if (this.data.flyEnabled)
		{
			if (this.isKeyPressed(this.data.moveUpKey))
				this.direction.add(this.up);

			if (this.isKeyPressed(this.data.moveDownKey))
				this.direction.sub(this.up);
		}

		this.direction.multiplyScalar(moveAmount);
		camera.position.add(this.direction);
	}
});

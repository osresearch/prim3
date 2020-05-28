/*
 * Prim's Maze generating algorithm in 3D.
 *
 * Derived from https://en.wikipedia.org/wiki/File:Prim_Maze_3D.svg
 */
/*
 * There are six possible exits from each position; these
 * are the bottom bits of the bitmap.
 * 1 = wall +x
 * 2 = wall -x
 * 3 = wall +y
 * 4 = wall -y
 * 5 = wall +z
 * 6 = wall -z
 */
const QUEUED	= 0x40;
const IN_MAZE	= 0x80;

AFRAME.registerComponent('maze3d', {
	schema: {
		width: {type:'number', default:4},
		height: {type:'number', default:4},
		depth: {type:'number', default:4},
	},

	rand: function(num)
	{
		return Math.floor(Math.random() * Math.floor(num));
	},

	init: function()
	{
		// build the maze
		const w = Math.floor(this.data.width);
		const d = Math.floor(this.data.depth);
		const h = Math.floor(this.data.height);
		console.log("building maze", w, d, h);
		this.build_maze(w,d,h);

		// now that we have the maze, add walls for
		// everywhere that there is not an opening
		for(var x = 0 ; x < w ; x++)
		{
			for(var y = 0 ; y < h ; y++)
			{
				for(var z = 0 ; z < d ; z++)
				{
					this.add_walls(x,y,z)
				}
			}
		}
	},

	add_walls: function(x,y,z)
	{
		// should we check if it is in the maze?
		var p = ~this.maze[x][y][z];

		// add the positive directions ones all the time
		if ((p & 0x01) && x == 0)
		{
			this.add_wall(x-0.5,y,z, 0, -90, 0);
			this.add_wall(x-0.5,y,z, 0, +90, 0);
		}
		if (p & 0x02) {
			this.add_wall(x+0.5,y,z, 0, -90, 0);
			this.add_wall(x+0.5,y,z, 0, +90, 0);
		}

		if ((p & 0x04) && y == 0)
		{
			this.add_wall(x,y-0.5,z, -90, 0, 0);
			this.add_wall(x,y-0.5,z, +90, 0, 0);
		}
		if (p & 0x08) {
			this.add_wall(x,y+0.5,z, -90, 0, 0);
			this.add_wall(x,y+0.5,z, +90, 0, 0);
		}

		if ((p & 0x10) && z == 0)
		{
			this.add_wall(x,y,z-0.5,    0, 0, 0);
			this.add_wall(x,y,z-0.5, +180, 0, 0);
		}
		if (p & 0x20) {
			this.add_wall(x,y,z+0.5,    0, 0, 0);
			this.add_wall(x,y,z+0.5, +180, 0, 0);
		}
	},

	add_wall: function(x,y,z,sx,sy,sz)
	{
		var obj = document.createElement('a-plane');
		//if (sx == 0) sx = 0.1;
		//if (sy == 0) sy = 0.1;
		//if (sz == 0) sz = 0.1;

		obj.setAttribute('position', {
			x: x,
			y: y,
			z: z,
		});

		obj.setAttribute('rotation', {
			x: sx,
			y: sy,
			z: sz,
		});

		obj.setAttribute('width', 1);
		obj.setAttribute('height', 1);

		obj.setAttribute('material', {
			src: '#square-texture',
			//color: "#888888",
		});

		this.el.appendChild(obj);
	},

	build_maze: function(w,d,h)
	{
		this.maze = [];
		this.todo = [];
		this.todo_num = 0;
		console.log("building maze", w, d, h);

		// create the empty maze array;
		// 0 == all walls, not yet in the maze, not enqueued
		for (var x = 0; x < w; ++x) {
			this.maze[x] = [];
			for (var y = 0; y < h; ++y) {
				this.maze[x][y] = [];
				for (var z = 0; z < d; ++z) {
					this.maze[x][y][z] = 0;
				}
			}
		}

		// Select random square of the grid, to start with.
		// could this be 0,0,0?
		var x = this.rand(w);
		var y = this.rand(h);
		var z = this.rand(d);

		// Mark this one in the maze and already processed
		this.maze[x][y][z] |= QUEUED | IN_MAZE;

		// add all of the surrounding ones to the queue
		this.enqueue_neighbors(x,y,z);

		// Keep processing the queue until all squares are processed
		while (this.todo_num > 0)
		{
			// Pick one from the queue to process
			var n = this.rand(this.todo_num);
			var p = this.todo[n];
			var x = p[0];
			var y = p[1];
			var z = p[2];

			// Remove it from the queue
			this.todo[n] = this.todo[--this.todo_num];

			// Try random directions to see if any of them
			// reach into the maze.
			for(var i = 0 ; i < 30 ; i++)
			{
				if (i == 29) console.log("UH OH", x, y, z);
				var nx = x;
				var ny = y;
				var nz = z;

				var d = this.rand(6);
				//console.log("Trying ", x, y, z, d)

				if (d == 0) nx = x - 1;
				if (d == 1) nx = x + 1;
				if (d == 2) ny = y - 1;
				if (d == 3) ny = y + 1;
				if (d == 4) nz = z - 1;
				if (d == 5) nz = z + 1;

				// if the cube at new xyz is not in the maze,
				// keep trying other random directions
				if ((this.get_walls(nx,ny,nz) & IN_MAZE) == 0)
					continue;

				// Connect this cube to the maze
				// via an opening in direction "d".
				// and flag that this cube is now part
				// of the maze.
				this.maze[x][y][z] |= (1 << d) | IN_MAZE;

				// and add an opening in the opposite of d
				// for the cube at new xyz
				this.maze[nx][ny][nz] |= (1 << (d^1));

				// flag all of the neighbors of this cube
				// as potential new maze members
				this.enqueue_neighbors(x,y,z);
				break;
			}
		}

		// Add an entrance and exit.
		//this.maze[0][Math.floor(h/2)][Math.floor(d/2)] |= 1;
		this.maze[0][2][2] |= 1;
		this.maze[w-1][Math.floor(h/2)][Math.floor(d/2)] |= 2;
	},

	// add all of the neighbors to the processing queue
	enqueue_neighbors: function(x,y,z)
	{
		this.enqueue(x + 1, y, z);
		this.enqueue(x - 1, y, z);
		this.enqueue(x, y + 1, z);
		this.enqueue(x, y - 1, z);
		this.enqueue(x, y, z + 1);
		this.enqueue(x, y, z - 1);
	},

	get_walls: function(x,y,z)
	{
		if (x < 0 || this.data.width <= x)
			return QUEUED;
		if (y < 0 || this.data.height <= y)
			return QUEUED;
		if (z < 0 || this.data.depth <= z)
			return QUEUED;
		return this.maze[x][y][z];
	},

	// add a xyz coordinate for processing,
	// if it is within the game area and not already enqueued
	enqueue: function(x,y,z)
	{
		// if it already queued for processesing,
		// then nothing else to do.
		if (this.get_walls(x,y,z) & QUEUED)
			return;

		// enqueue it for adding to the maze eventually
		this.todo[this.todo_num++] = [x,y,z];
		this.maze[x][y][z] |= QUEUED;
	},
});

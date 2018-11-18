game.Path = me.Polygon.extend({
	init: function (x, y, data) {
		var vectors = [];
		for (const point of data.points) {
			vectors.push(new me.Vector2d(point.x, point.y));
		}
		this._super(me.Polygon, "init", [
			x,y,vectors
		]);
		this.name = data.id;
		this.length = 0;
		this.map = [];
		for (let i = 0; i < vectors.length - 1; i++) {
			const prev = this.length;
			this.length += vectors[i].distance(vectors[i + 1]);
			this.map.push({
				a: prev,
				b: this.length,
				diff: this.length - prev,
				v1: vectors[i],
				v2: vectors[i + 1]
			});
		}
		console.log(this.map);
	},

	update: function (params) {
		//console.log(params);
	},

	posAt: function (vec, pixelAlong) {
		for (const range of this.map) {
			if (pixelAlong >= range.a && pixelAlong < range.b) {
				const alongVector = range.diff - (range.b - pixelAlong);
				const angle = Math.atan2(
					/* this.pos.y * 2 +  */range.v2.y - range.v1.y, 
					/* this.pos.x * 2 +  */range.v2.x - range.v1.x);
				vec.x = range.v1.x + this.pos.x + (Math.cos(angle) * alongVector);
				vec.y = range.v1.y + this.pos.y + (Math.sin(angle) * alongVector);
				return;
			}
		}
	}
});

game.Hazard = me.Sprite.extend({
	init: function (x, y, settings) {
		this._super(me.Sprite, "init", [
			x, y,
			settings
		]);
		this.alwaysUpdate = true;

		// add a physic body
		this.body = new me.Body(this);
		this.body.addShape(new me.Rect(0, 0, this.width, this.height))
		// set the collision type
		this.body.collisionType = me.collision.types.WORLD_SHAPE;
		this.type = "hazard";
		// enable physic
		this.isKinematic = false;
		this.inity = this.pos.y;
		this.initx = this.pos.x;
		this.rangemin = this.pos.x + settings.min_x;
		this.rangemax = this.pos.x + settings.max_x;
		this.timerange = Math.abs(this.rangemax - this.rangemin);
		this.moverange = settings.moverange;
		this.pathname = settings.path;
		this.curpoint = 0;
		this.direction = 1;
		this.speed = 2;
	},

	/* onCollision: function (response, other) {
		return true;
	}, */

	update: function (dt) {
		//Find path
		if (this.pathname && !this.path) {
			this.path = me.game.world.getChildByName(this.pathname)[0];
		}
		if (this.path) {
			/* const targetx = this.path.pos.x + this.path.points[this.curpoint].x;
			const targety = this.path.pos.y + this.path.points[this.curpoint].y;
			const distx = this.pos.x - targetx;
			const disty = this.pos.y - targety;
			this.pos.x += distx < this.speed ? this.speed : distx > this.speed ? -this.speed : 0;
			this.pos.y += disty < this.speed ? this.speed : disty > this.speed ? -this.speed : 0;
			if (Math.abs(distx) <= this.speed && Math.abs(disty) <= this.speed) {
				if (this.curpoint == this.path.points.length - 1 || 
					(this.curpoint == 0 && this.direction == -1))
					this.direction = -this.direction;
				this.curpoint += this.direction;
			} */
			this.path.posAt(this.pos, this.curpoint);
			this.curpoint = (this.curpoint + 3) % this.path.length;
		}
		return (this._super(me.Entity, "update", [dt]));
	}
});

game.HazardWeight = game.Hazard.extend({
	init: function (x, y, settings) {
		this._super(game.Hazard, "init", [
			x, y,
			Object.assign({
				image: game.texture,
				region: "weight.png"
			}, settings)
		]);
	},
	update: function () {
		this._super(game.Hazard, "update");
		if (game.data.time > this.rangemin && game.data.time < this.rangemax) {
			this.pos.y = this.inity + ((this.rangemax - game.data.time) / this.timerange) * this.moverange;
		}
	}
});

game.HazardPlatform = game.Hazard.extend({
	init: function (x, y, settings) {
		this._super(game.Hazard, "init", [
			x, y,
			Object.assign({
				image: game.texture,
				region: "platform.png"
			}, settings)
		]);
	},
	update: function () {
		this._super(game.Hazard, "update");
		if ((game.data.time > this.rangemin && game.data.time < this.rangemax)
			|| (game.data.time < this.rangemin && game.data.time > this.rangemax)) {
			this.pos.x = this.initx + (Math.abs(this.rangemax - game.data.time) / this.timerange) * this.moverange;
		}
	}
});

game.Path = me.Polygon.extend({
	init: function (x, y, data) {
		var vectors = [];
		data.points.forEach(function (point) {
			vectors.push(new me.Vector2d(point.x, point.y));
		}, this);
		if (vectors.length == 2)
			vectors.push(vectors[1]);
		console.log(data.id, vectors);
		
		this._super(me.Polygon, "init", [
			x,y,vectors
		]);
		this.name = data.id;
		this.length = 0;
		this.map = [];
		for (var i = 0; i < data.points.length - 1; i++) {
			var prev = this.length;
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
		this.map.forEach(function (range) {
			if (pixelAlong >= range.a && pixelAlong < range.b) {
				var alongVector = range.diff - (range.b - pixelAlong);
				var angle = Math.atan2(range.v2.y - range.v1.y, range.v2.x - range.v1.x);
				vec.x = range.v1.x + this.pos.x + (Math.cos(angle) * alongVector);
				vec.y = range.v1.y + this.pos.y + (Math.sin(angle) * alongVector);
				return;
			}
		}, this);
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
		this.rangemin = this.pos.x + settings.min_x;
		this.rangemax = this.pos.x + settings.max_x;
		this.timerange = Math.abs(this.rangemax - this.rangemin);
		//this.moverange = settings.moverange;
		this.pathname = settings.path;
		this.curpoint = 0;
	},

	/* onCollision: function (response, other) {
		return true;
	}, */

	update: function (dt) {
		//Find path
		if (this.pathname && !this.path) {
			this.path = me.game.world.getChildByName(this.pathname)[0];
		}

		//Follow path
		if (this.path) {
			this.curpoint = ((this.rangemax - game.data.time) / this.timerange) * this.path.length;
			this.path.posAt(this.pos, this.curpoint);
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
	/* update: function () {
		this._super(game.Hazard, "update");
		if (game.data.time > this.rangemin && game.data.time < this.rangemax) {
			this.pos.y = this.inity + ((this.rangemax - game.data.time) / this.timerange) * this.moverange;
		}
	} */
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
	/* update: function () {
		this._super(game.Hazard, "update");
		if ((game.data.time > this.rangemin && game.data.time < this.rangemax)
			|| (game.data.time < this.rangemin && game.data.time > this.rangemax)) {
			this.pos.x = this.initx + (Math.abs(this.rangemax - game.data.time) / this.timerange) * this.moverange;
		}
	} */
});

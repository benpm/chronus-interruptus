game.Path = me.Polygon.extend({
	init: function (x, y, points) {
		this._super(me.Polygon, "init", [
			x,y,points
		]);
		console.log(x, y, points);
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
	},

	/* onCollision: function (response, other) {
		return true;
	}, */

	/* update: function (dt) {
		this.pos.x = this.initx;
		this.pos.y = this.inity;
		this.body.update(dt);
		me.collision.check(this);
		return (this._super(me.Entity, "update", [dt]));
	} */
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

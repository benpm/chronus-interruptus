game.Hazard = me.Sprite.extend({
	init: function (x, y, settings) {
		this._super(me.Sprite, "init", [
			x, y,
			Object.assign({
				image: game.texture,
				region: "weight.png"
			}, settings)
		]);

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
	update: function () {
		this._super(game.Hazard, "update");
		this.pos.y = this.inity + Math.sin(game.data.time / 1000) * 200;
	}
});

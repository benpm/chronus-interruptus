game.KeyEntity = me.Sprite.extend({
    /**
     * constructor
     */
	init: function (x, y, settings) {
		// call the super constructor
		this._super(me.Sprite, "init", [
			x, y,
			Object.assign({
				image: game.texture,
				region: "key.png"
			}, settings)
		]);

		// add a physic body
		this.body = new me.Body(this);
		this.body.addShape(new me.Ellipse(this.width / 2, this.height / 2, this.width, this.height))
		// set the collision type
		this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
		// enable physic
		this.isKinematic = false;

		this.heldby = null;
	},

	unhold: function () {
		this.heldby = null;
	},

    /**
     * collision handling
     */
	onCollision: function (response, other) {

		/* // do something when collide
		me.audio.play("cling", false);
		// give some score
		game.data.score += 250;

		//avoid further collision and delete it
		this.body.setCollisionMask(me.collision.types.NO_OBJECT);

		me.game.world.removeChild(this); */
		if (other.body.collisionType == me.collision.types.WORLD_SHAPE) {
			return true;
		}
		if (other == game.data.player && !this.heldby && me.input.isKeyPressed("action")) {
			console.log("HOLDING");
			this.heldby = game.data.player;
			game.data.player.holding = this;
		}

		return false;
	},

	update: function (dt) {
		if (this.heldby) {
			this.pos.x = this.heldby.pos.x;
			this.pos.y = this.heldby.pos.y + 32;
		} else {
			this.body.update(dt);
			me.collision.check(this);
		}
		game.data.time = this.pos.x;
		// check if we moved (an "idle" animation would definitely be cleaner)
		if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
			(this.renderable && this.renderable.isFlickering())
		) {
			this._super(me.Entity, "update", [dt]);
			return true;
		}
		return false;
	}
});

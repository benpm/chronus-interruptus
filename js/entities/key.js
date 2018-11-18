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
		this.body.addShape(new me.Rect(0, 0, this.width, this.height))
		// set the collision type
		this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
		this.body.setFriction(0.4, 0);
		// enable physic
		this.isKinematic = false;

		this.heldby = null;
	},

	unhold: function () {
		this.heldby.action = false;
		this.heldby = null;
		console.log("unheld");
	},

    /**
     * collision handling
     */
	onCollision: function (response, other) {
		if (this.heldby) {
			return false;
		}
		if (other.name == "mainPlayer" && other.action) {
			console.log("HOLDING");
			this.heldby = other;
			other.action = false;
			other.holding = this;
		}
		if (other.body.collisionType == me.collision.types.WORLD_SHAPE) {
			if (other.type === "platform") {
				if (this.body.falling &&
					!me.input.isKeyPressed("down") &&
					// Shortest overlap would move the player upward
					(response.overlapV.y > 0) &&
					// The velocity is reasonably fast enough to have penetrated to the overlap depth
					(~~this.body.vel.y >= ~~response.overlapV.y)
				) {
					// Disable collision on the x axis
					response.overlapV.x = 0;
					// Repond to the platform (it is solid)
					return true;
				}
				// Do not respond to the platform (pass through)
				return false;
			}

			// Custom collision response for slopes
			else if (other.type === "slope") {
				// Always adjust the collision response upward
				response.overlapV.y = Math.abs(response.overlap);
				response.overlapV.x = 0;

				// Respond to the slope (it is solid)
				return true;
			}

			// Custom collision response for slopes
			else if (other.type === "hazard") {
				return true;
			}
			return true;
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
		// check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            this.pos.y = 0;
        }
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

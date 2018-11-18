game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this._super(me.Entity, "init", [x, y, settings]);
        
        // set the global
        game.data.player = this;

        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;

        // walking & jumping speed
        this.body.setMaxVelocity(5, 15);
        this.body.setFriction(0.4, 0);

        this.dying = false;

        this.mutipleJump = 1;

        this.holding = null;
        this.facing = 1;
        this.action = false;
        this.ondoor = null;
        this.health = 3;

        this.zee = new me.Sprite(x, y, {
            image: game.texture,
            region: "key.png"
        });

        // set the viewport to follow this renderable on both axis, and enable damping
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH, 0.1);

        // enable keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.Z, "action", true);
        me.input.bindKey(me.input.KEY.R,     "reset", true);
        me.input.bindKey(me.input.KEY.X,     "jump", true);
        me.input.bindKey(me.input.KEY.UP,    "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        me.input.bindKey(me.input.KEY.DOWN, "down");

        me.input.bindKey(me.input.KEY.A,     "left");
        me.input.bindKey(me.input.KEY.D,     "right");
        me.input.bindKey(me.input.KEY.W,     "jump", true);
        me.input.bindKey(me.input.KEY.S,     "down");

        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_1}, me.input.KEY.UP);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_2}, me.input.KEY.UP);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.DOWN}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_3}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_4}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.LEFT}, me.input.KEY.LEFT);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.RIGHT}, me.input.KEY.RIGHT);

        // map axes
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LX, threshold: -0.5}, me.input.KEY.LEFT);
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LX, threshold: 0.5}, me.input.KEY.RIGHT);
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LY, threshold: -0.5}, me.input.KEY.UP);

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "walk0001.png", "walk0002.png", "walk0003.png",
            "walk0004.png", "walk0005.png", "walk0006.png",
            "walk0007.png", "walk0008.png", "walk0009.png",
            "walk0010.png", "walk0011.png"
        ]);

        // define a basic walking animatin
        this.renderable.addAnimation("walk", [
            { name: "walk0001.png", delay: 30 },
            { name: "walk0002.png", delay: 30 },
            { name: "walk0003.png", delay: 30 },
            { name: "walk0004.png", delay: 30 },
            { name: "walk0005.png", delay: 30 },
            { name: "walk0006.png", delay: 30 },
            { name: "walk0007.png", delay: 30 },
            { name: "walk0008.png", delay: 30 },
            { name: "walk0009.png", delay: 30 },
            { name: "walk0010.png", delay: 30 },
            { name: "walk0011.png", delay: 30 }]);

        // jumping animation
        this.renderable.addAnimation("jump", [
            { name: "walk0007.png", delay: 1000 }]);
        
        // set as default
        this.renderable.setCurrentAnimation("walk");

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 0.5);
    },

    /* -----

        update the player pos

    ------            */
    update : function (dt) {

        if (me.input.isKeyPressed("left"))    {
            this.body.force.x = -this.body.maxVel.x;
            this.renderable.flipX(true);
            if (this.holding) {
                this.holding.anchorPoint.set(1.0, 0.0);
                this.holding.flipX(true);
            }
            this.facing = -1;
        } else if (me.input.isKeyPressed("right")) {
            this.body.force.x = this.body.maxVel.x;
            this.renderable.flipX(false);
            if (this.holding) {
                this.holding.anchorPoint.set(-0.5, 0.0);
                this.holding.flipX(false);
            }
            this.facing = 1;
        } else {
            this.body.force.x = 0;
        }

        if (me.input.isKeyPressed("jump")) {
            this.body.jumping = true;
            if (this.multipleJump <= 2) {
                // easy "math" for double jump
                this.body.force.y = -this.body.maxVel.y * this.multipleJump++;
                me.audio.play("jump", false);
            }
        }
        else {

            this.body.force.y = 0;

            if (!this.body.falling && !this.body.jumping) {
                // reset the multipleJump flag if on the ground
                this.multipleJump = 1;
            }
            else if (this.body.falling && this.multipleJump < 2) {
                // reset the multipleJump flag if falling
                this.multipleJump = 2;
            }
        }

        // reset
        if (me.input.isKeyPressed("reset")) {
            me.levelDirector.reloadLevel();
            return true;
        }

        // action key
        if (me.input.isKeyPressed("action"))
            this.action = true;
        if (!me.input.keyStatus("action"))
            this.action = false;
        if (this.action && this.holding) {
            this.holding.body.vel.x = this.facing * 15;
            this.holding.body.vel.y = -15;
            this.holding.unhold();
            this.holding = null;
            this.action = false;
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            // if yes reset the game
            me.game.world.removeChild(this);
            me.game.viewport.fadeIn("#fff", 150, function(){
                me.audio.play("die", false);
                me.levelDirector.reloadLevel();
                me.game.viewport.fadeOut("#fff", 150);
            });
            return true;
        }

        // handle collisions against other shapes
        me.collision.check(this);

        if (!this.body.falling && !this.body.jumping && !this.renderable.isCurrentAnimation("walk"))
            this.renderable.setCurrentAnimation("walk");            

        if (this.body.jumping && !this.renderable.isCurrentAnimation("jump"))
            this.renderable.setCurrentAnimation("jump");

        if (this.body.vel.x == 0)
            this.renderable.setAnimationFrame(0);

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
            (this.renderable && this.renderable.isFlickering())
        ) {
            this._super(me.Entity, "update", [dt]);
            return true;
        }

        return false;
    },


    /**
     * colision handler
     */
    onCollision : function (response, other) {
        switch (other.body.collisionType) {

            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
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
                break;

            case me.collision.types.ENEMY_OBJECT:
                if (!other.isMovingEnemy) {
                    // spike or any other fixed danger
                    this.body.vel.y -= this.body.maxVel.y * me.timer.tick;
                    this.hurt();
                }
                else {
                    // a regular moving enemy entity
                    if ((response.overlapV.y > 0) && this.body.falling) {
                        // jump
                        this.body.vel.y -= this.body.maxVel.y * 1.5 * me.timer.tick;
                    }
                    else {
                        this.hurt();
                    }
                    // Not solid
                    return false;
                }
                break;

            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }

        // Make the object solid
        return true;
    },


    /**
     * ouch
     */
    hurt: function () {
        if (!this.renderable.isFlickering())
        {
            this.health -= 1;
            this.renderable.flicker(750);
            // flash the screen
            me.game.viewport.fadeIn("#FFFFFF", 75);
            me.audio.play("die", false);
            if (this.health <= 0) {
                me.levelDirector.reloadLevel();
            }
        }
    }
});

game.Message = me.Renderable.extend({
    init: function (x, y, settings) {
        this._super(me.Renderable, "init", [x, y, settings.width, settings.height]);
        this.message = settings.message;
        this.font = new me.BitmapFont(me.loader.getBinary("PressStart2P"), me.loader.getImage("PressStart2P"), 0.75, "center", "bottom");
        this.bg = new me.Sprite(x, y, {
            image: game.texture,
            region: "black.png"
        });
        this.bg.pos.z = -1;
        this.display = false;
        this.box = this.getBounds();
        this.timeoutHandler = null;
    },

    timeout: function () {
        this.display = false;
    },

    update: function (dt) {
        if (!this.display && this.box.overlaps(game.data.player.getBounds())) {
            this.display = true;
            if (this.timeoutHandler) {
                clearTimeout(this.timeoutHandler);
                this.timeoutHandler = null;
            }
            return true;
        }
        if (this.display && !this.box.overlaps(game.data.player.getBounds())) {
            this.timeoutHandler = setTimeout(this.timeout.bind(this), 1500);
        }
        return false;
    },

    draw: function (renderer) {
        if (this.display) {
            this.font.draw(renderer, this.message, this.pos.x + 70, this.pos.y);
        }
    }
});

game.Door = me.LevelEntity.extend({
    init: function (x, y, settings) {
        this._super(me.LevelEntity, "init", [x, y, settings]);
        this.isKinematic = false;
    },

    onCollision: function (response, other) {
        if (other.name == "mainPlayer") {
            other.ondoor = this;
            if (other.action)
                this._super(me.LevelEntity, "onCollision", [response, other]);
        }
        return false;
    }
});

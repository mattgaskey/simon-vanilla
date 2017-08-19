var model = {
	//used to translate computer choice from random number to 
	//color association
	grid: ['red', 'blue', 'yellow', 'green'],
	//round counter for display and game status check
	round: 0,
	//computer-built sequence
	matchSequence: [],
	//player-built sequence
	playerSequence: [],
	//power toggle
	power: false,
	//turn status handler, keeps user clicks in check
	playerTurn: false,
	//strict mode
	strict: false,
	//volume mode
	volume: false
};

var control = {
	//setState function
	setState: function(key, value) {
		model[key] = value;
	},

	//retireve state, for use in view
	getState: function(key) {
		return model[key];
	},

	//add player's game square click to playerSequence array list
	updatePlayerSequence: function(move) {
		if (model.playerTurn) {
			var arrayvar = model.playerSequence;
			arrayvar.push(move);

			control.setState('playerSequence', arrayvar);

			//check game status after every click
			setTimeout(function() {
				return control.checkPlayerMove();
			}, 100);
		}
	},

	//return random item from an array
	random: function(arr) {
		var n = arr.length;
		var x = Math.floor(Math.random() * n);
		return arr[x];
	},

	//choose random number between 0 and 3 and add the item from 
	//grid array to the matchSequence array
	computerMove: function() {
		var move = control.random(model.grid);
		var arrayvar = model.matchSequence;
		arrayvar.push(move);

		
		control.loopThroughMoves(arrayvar);

		control.setState('matchSequence', arrayvar);
		control.setState('playerTurn', true);
		view.allowFlash(true);
	},

	//loop through computerMoveSequence and flash each move with delay
	loopThroughMoves: function(arr) {
		var x;
		arr.forEach(function(move, i) {
			var power = control.getState('power');
			if (power === true) {
				x = setTimeout(function() {
					return view.flashGrid(move)
				}, (i+1) * 600);
			} 
			if (power === false) {
				clearTimeout(x);
			} 
		});
	},

	//logic selector to check player moves against the matchSequence
	checkPlayerMove: function() {
		var n = model.playerSequence.length;
		var lastMove = model.playerSequence[n - 1];
		var matchSoFar = model.matchSequence[n - 1];

		//player makes a move which does not match the matchSequence
		if (matchSoFar !== lastMove) {
			control.playerMistake();
			view.updateCounter();
		} 

		//check for end game
		else if (model.matchSequence.length === 20 && model.matchSequence.length === n && matchSoFar === lastMove) {
			control.endgame();
		} 

		//player has successfully matched the entire matchSequence
		else if (model.matchSequence.length === n && matchSoFar === lastMove) {
			control.playerSuccess();
			setTimeout(function() {
				return control.computerMove();
			}, 500);
		}	

		//becuase player moves are checked after each addition, 
		//no need to check for positive moves that do not complete
		//the round
	},

	//player wins, show msg and restart the game
	endgame: function() {
		var msg = control.random(view.success);
		setTimeout(function() {
			return view.playAudio('success')
		}, 500);
		view.showModal(msg);
		control.setState('round', 1);
		control.setState('playerTurn', false);
		control.setState('matchSequence', []);
		control.setState('playerSequence', []);
		view.updateCounter();
		view.allowFlash(false);
		setTimeout(function() {
				view.showModal();
				control.init();
		}, 2000);
	},

	//reset to initial state
	playerMistake: function() {
		var strict = model.strict;
		var nonStrictMsg = control.random(view.softErrors);
		var strictMsg = control.random(view.hardErrors);
		
		//if strict reset game entirely
		if (strict === true) {
			view.showModal(strictMsg);
			view.playAudio('hard_fail');
			control.setState('round', 1);
			control.setState('playerTurn', false);
			control.setState('matchSequence', []);
			control.setState('playerSequence', []);
			setTimeout(function() {
				return control.init();
			}, 1000);
			setTimeout(function() {
				return view.showModal();
			}, 1000);
		//if not strict, reset round only
		} else if (strict === false) {
			view.showModal(nonStrictMsg);
			view.playAudio('soft_fail');
			control.setState('playerTurn', false);
			control.setState('playerSequence', []);
			setTimeout(function() {
				return view.showModal();
			}, 1000);
			setTimeout(function() {
				return control.loopThroughMoves(model.matchSequence);
			}, 1000);
			control.setState('playerTurn', true);
			view.allowFlash(true);
		}
	},

	//increment the round, reset playerSequence and add computer move
	//to matchSequence 
	playerSuccess: function() {
		var x = model.round + 1;
		control.setState('round', x);
		control.setState('playerTurn', false);
		control.setState('playerSequence', []);
		view.allowFlash(false);
		view.updateCounter();
	},

	//first round is automatic after init flash
	init: function() {
		view.updateCounter();
		control.computerMove();
	},

	//power off, reset all states
	powerDown: function() {
		control.setState('round', 0);
		control.setState('matchSequence', []);
		control.setState('playerSequence', []);
		control.setState('power', false);
		view.allowFlash(false);
		view.updateCounter();
	},

	//power on and begin init
	powerUp: function() {
		control.setState('matchSequence', []);
		control.setState('round', 1);
		control.setState('power', true);
		view.allowFlash(true);
		setTimeout(function() {
			return control.init();
		}, 1000);

	},

	//click handler for user clicks in grid area
	handleGridClick: function(e) {
		e.preventDefault();
		var color = this.id;
		control.updatePlayerSequence(color);
		view.flashGrid(color);
	},

	//click handler for power button
	handlePowerButton: function() {
		var x = control.getState('power');
		if (x === true) {
			control.powerDown();
			view.powerDownCounter();
		} else if (x === false) {
			control.powerUp();
			view.powerUpCounter();
		}
	},

	//click handler for reset button
	handleReset: function() {
		var power = model.power;
		if (power === true) {
			control.setState('round', 1);
			control.setState('playerTurn', false);
			control.setState('matchSequence', []);
			control.setState('playerSequence', []);
			setTimeout(function() {
				return control.init();
			}, 1000);
		}
	},

	//click handler for strict mode toggle
	strictModeToggle: function() {
		var x = model.strict;
		control.setState('strict', !x);
		control.handleReset();
	},

	//click handler for volume mode toggle
	volumeModeToggle: function() {
		var x = model.volume;
		control.setState('volume', !x);
	},

	//game start
	start: function() {
		view.render();
	}
};

var view = {

	//initialize the game board
	render: function() {
		var power = document.getElementById('power');
		var reset = document.getElementById('reset');
		var strict = document.getElementById('strict');
		var volume_on = document.getElementById('volume_on');
		var volume_off = document.getElementById('volume_off');

		power.addEventListener('mousedown', view.handlePower, true);
		reset.addEventListener('click', view.reset, true);
		strict.addEventListener('click', view.strictToggle, true);
		volume_on.addEventListener('click', view.volumeToggle, true);
		volume_off.addEventListener('click', view.volumeToggle, true);
	},

	//local click handler for power button
	handlePower: function(e) {
		e.preventDefault();
		view.updateCounter();
		control.handlePowerButton();
		//flash the game board on power up/down
		//forEach on nodeList only for modern browsers
		// grids.forEach(function(grid, i) {
		// 	grid.classList.add('flash');
		// 	setTimeout(function(){grid.classList.remove('flash')},800);
		// });
		var grids = document.querySelectorAll('.grid-block');
		for (var i = 0; i < grids.length; i++) {
			(function(ind) {
				grids[ind].classList.add('flash');
				setTimeout(function() {grids[ind].classList.remove('flash')},800);
			})(i);
		}
	},

	//turn flash on click on/off
	allowFlash: function(x) {
		//forEach on nodeList only for modern browsers
		// grids.forEach(function(grid, i) {
		// 	if (x === true) {
		// 		grid.addEventListener('click', control.handleGridClick, true);
		// 	} else if (x === false) {
		// 		grid.removeEventListener('click', control.handleGridClick, true);
		// 	}
		// });
		var grids = document.querySelectorAll('.grid-block');

		for (var i = 0; i < grids.length; i++) {
			if (x === true) {
				grids[i].addEventListener('click', control.handleGridClick, true);
			} else if (x === false) {
				grids[i].removeEventListener('click', control.handleGridClick, true);
			}
		}
	},

	//local handler for reset button
	reset: function(e) {
		e.preventDefault();
		var self = this;
		var power = control.getState('power');
		if (power === true) {
			self.classList.add('press');
			setTimeout(function(){self.classList.remove('press')},500);

			control.handleReset();
		}
	},

	//local click handler for volume control
	volumeToggle: function(e) {
		e.preventDefault();
		var volume = control.getState('volume');
		if (volume === true) {
			var volume_off = document.getElementById('volume_off');
			this.classList.add('hidden');
			volume_off.classList.remove('hidden');
		} else if (volume === false) {
			var volume_on = document.getElementById('volume_on');
			this.classList.add('hidden');
			volume_on.classList.remove('hidden');
		}
		control.volumeModeToggle();
	},

	//local handler for strict button
	strictToggle: function(e) {
		e.preventDefault();
		var power = control.getState('power');
		var self = this;
		var strict_led = document.getElementById('strict_led');
		var strict_mode = control.getState('strict');

		if (power === true) {
			self.classList.add('press');
			setTimeout(function(){self.classList.remove('press')},500);

			if (strict_mode === false) {
				strict_led.classList.remove('hidden');
			} else if (strict_mode === true) {
				strict_led.classList.add('hidden');
			}

			control.strictModeToggle();
		}
	},

	//turn on the red counter
	powerUpCounter: function() {
		var counter = document.getElementById('counter');
		counter.classList.remove('counter-faded');
	},

	//turn off the red counter
	powerDownCounter: function() {
		var counter = document.getElementById('counter');
		counter.classList.add('counter-faded');
	},

	//set the counter to the appropriate round number
	updateCounter: function() {
		var n = control.getState('round');
		var counter = document.getElementById('counter');
		counter.innerHTML = n;
	},

	//flash a grid area
	flashGrid: function(color) {
		var grid = document.getElementById(color);
		var sound = control.getState('volume');
		grid.classList.add('flash');
		setTimeout(function(){grid.classList.remove('flash')},500);
		view.playAudio(color);
	},

	//show the modal window with error or success message
	showModal: function(msg) {
		var modal = document.getElementById('modal');
		modal.classList.toggle('hidden');
		modal.innerHTML = msg;
	},

	//play audio with grid area flash
	playAudio: function(color) {
		var audio = new Audio('src/audio/' + color + '.wav');
		var volume = control.getState('volume');
		if (volume === true) {
			audio.play();
		}
	},

	softErrors: ['Oops! Not quite', 'Just a bit off', 'Try again!', 'Almost there'],
	hardErrors: ['What was that?', 'Uff! Horrible', 'Seriously?', 'Despicable'],
	success: ['Awesome!', 'You did it!', 'Nice work!', 'You won!']

};

control.start();
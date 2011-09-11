(function($){
	$.CI_Validation = function() {
		this.rules = {};
		this.messages = {
			'required': '%s is required.',
			'max_length': '%s is less than %s.'
		};
		this.errors = {};

		/**
		 * Set validation rules.
		 * 
		 * @params item string
		 * @params value string
		 * @params item_name string
		 * @params rules string(separator pipe)
		 * @params callbacks hash
		 * @return boolean
		 */
		this.set_rules = function(item, value, item_name, rules, callbacks) {
			callbacks = callbacks || {};
			this.rules[item] = {
				item_name: item_name,
				value: value,
				validators: this._parse_rules(rules, callbacks)
			};
		}

		this._parse_rules = function(rules, callbacks) {
			var splited = rules.split('|');
			var validators = [];
			for (var i=0; i<splited.length; i++) {
				var name = splited[i];
				var validator = {name: name, argument: null, is_callback: false, callback: null};

				if (this._is_validator(name)) {
					validator.name = this._validator_name(name);
					validator.argument = this._validator_argument(name);
					validators.push(validator);
				} else if (this._is_callback(name)) {
					validator.is_callback = true;
					validator.callback = callbacks[this._callback_name(name)];
					validators.push(validator);
				}
			}

			return validators;
		}

		this._validator_argument = function(name) {
			name.match($.CI_Validation.VALIDATOR_RE);
			var argument = RegExp.$3;
			if (typeof argument === 'undefined' || argument === '') {
				return undefined;
			} else {
				return argument;
			}
		}

		this._is_validator = function(name) {
			return $.CI_Validation.IS_VALIDATOR(name);
		}

		this._validator_name = function(name) {
			name.match($.CI_Validation.VALIDATOR_RE);
			return RegExp.$1;
		}

		this._is_callback = function(name) {
			return name !== null && name.match($.CI_Validation.CALLBACK_RE);
		}

		this._callback_name = function(name) {
			name.match($.CI_Validation.CALLBACK_RE);
			return RegExp.$1;
		}

		/**
		 * Execute validation.
		 *
		 * @return boolean
		 */
		this.run = function() {
			console.log(this.rules);
			for (var item in this.rules) {
				var rule = this.rules[item];
				for (var j=0; j<rule.validators.length; j++) {
					var validator = rule.validators[j];
					if (validator.is_callback) {
						// need add message every callback method.
						if (!validator.callback.apply(this, [rule.value])) {
							break;
						}
					} else {
						if (!$.CI_Validation[validator.name](rule.value, [validator.argument])) {
							this._set_error_message(item, this._error_message(rule, validator));
							break;
						}
					}
				}
			}

			return !this.has_errors();
		}

		this._set_error_message = function(item, msg) {
			this.errors[item] = msg;
		}

		this._error_message = function(rule, validator) {
			if (validator.name in this.messages) {
				var msg = this.messages[validator.name].replace('%s', rule.item_name);
				if (typeof validator.argument !== 'undefined') {
					msg = msg.replace('%s', validator.argument);
				}
				return msg;
			}
			return false;
		}

		/**
		 * Return true if has errors.
		 *
		 * @return boolean
		 */
		this.has_errors = function() {
			for (var k in this.errors) {
				return true;
			}
			return false;
		};
	};

	$.CI_Validation.prototype.VALIDATOR_RE = new RegExp("^([^\\[\\]]+)(\\[([^\\[\\]]*)\\])?$");
	$.CI_Validation.prototype.CALLBACK_RE = new RegExp("^callback_(.+)$");
	
	$.CI_Validation.prototype.is_validator = function(name) {
		if (name === null) return false;
		if (name.match($.CI_Validation.VALIDATOR_RE)) {
			var method = RegExp.$1;
			for (var i=0; i<$.CI_Validation.validators.length; i++) {
				if ($.CI_Validation.validators[i] === method) {
					return true;
				}
			}
		}
	};

	// Validators
	$.CI_Validation.prototype.validatros = {
		required: function(str) {
			return str !== null && str !== '';
		},
		max_length: function(str, max) {
			return str.length <= parseInt(max);
		}
	};
})(jQuery);
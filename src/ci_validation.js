/**
 * Form_validation based CodeIniger.
 * 
 * @version 0.1
 * @author Tatsuya Fukata
 * @see http://fukata.org
 */
var CI_Validation = function() {
	this.rules = {};
	this.messages = {};
	this.errors = {};

	/**
	 * Set validation rules.
	 * 
	 * @params item string
	 * @params label string
	 * @params rules string(separator pipe)
	 * @params callbacks hash
	 * @return Hash Rule hash 
	 */
	this.set_rules = function(item, label, rules, callbacks) {
		callbacks = callbacks || {};
		this.rules[item] = {
			label: label,
			value: undefined,
			validators: this._parse_rules(rules, callbacks),
			set_value: function(val) {
				this.value = (typeof val === 'undefined') ? val : "" + val;
			}
		};
		return this.rules[item];
	}

	/**
	 * Set input value.
	 * 
	 * @params item string
	 * @params value mixed
	 */
	this.set_value = function(item, val) {
		if (item in this.rules) {
			this.rules[item].value = (typeof val === 'undefined') ? val : "" + val;
		}
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
		name.match(CI_Validation.prototype.VALIDATOR_RE);
		var argument = RegExp.$3;
		if (typeof argument === 'undefined' || argument === '') {
			return undefined;
		} else {
			return argument;
		}
	}

	this._is_validator = function(name) {
		return CI_Validation.prototype.HAS_VALIDATOR(name);
	}

	this._validator_name = function(name) {
		name.match(CI_Validation.prototype.VALIDATOR_RE);
		return RegExp.$1;
	}

	this._is_callback = function(name) {
		return name !== null && name.match(CI_Validation.prototype.CALLBACK_RE);
	}

	this._callback_name = function(name) {
		name.match(CI_Validation.prototype.CALLBACK_RE);
		return RegExp.$1;
	}

	/**
	 * Execute validation.
	 *
	 * @return boolean
	 */
	this.run = function() {
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
					if (!CI_Validation.prototype.validators[validator.name](rule.value, [validator.argument])) {
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
		var msg = false;

		if (validator.name in this.messages) {
			msg = this.messages[validator.name].replace('%s', rule.label);
		} else if (validator.name in CI_Validation.prototype.messages) {
			msg = CI_Validation.prototype.messages[validator.name].replace('%s', rule.label);
		}

		if (msg !== false) {
			if (typeof validator.argument !== 'undefined') {
				msg = msg.replace('%s', validator.argument);
			}
		}

		return msg;
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

CI_Validation.prototype.VALIDATOR_RE = new RegExp("^([^\\[\\]]+)(\\[([^\\[\\]]*)\\])?$");
CI_Validation.prototype.CALLBACK_RE = new RegExp("^callback_(.+)$");

CI_Validation.prototype.HAS_VALIDATOR = function(name) {
	if (name === null) return false;
	if (name.match(CI_Validation.prototype.VALIDATOR_RE)
		&& RegExp.$1 in CI_Validation.prototype.validators) {
		return true;
	}
	return false;
};

/**
 * Validators
 */
CI_Validation.prototype.validators = {
	required: function(str) {
		return typeof str !== 'undefined' && str !== null && str !== '';
	},
	max_length: function(str, max) {
		return str.length <= parseInt(max, 10);
	},
	min_length: function(str, min) {
		return str.length > parseInt(min, 10);
	},
	int_num: function(str) {
		return str.match(/^[0-9]+$/);
	},
	float_num: function(str) {
		return str.match(/^[0-9]+(\.[0-9]+)?$/);
	},
	numeric: function(str) {
		return str.match(/^(\+|\-)?[0-9]+(\.[0-9]+)?$/);
	},
	email: function(str) {
		return str.match(/^[A-Za-z0-9]+[\w-]+@[\w\.-]+\.\w{2,}$/);
	}
};

/**
 * Messages
 */
CI_Validation.prototype.messages = {
	'required': '%s is required.',
	'max_length': '%s is less than %s.',
	'min_length': '%s is greater than %s.',
	'int_num': '%s is invalid integer.',
	'float_num': '%s is invalid float.',
	'numeric': '%s is invalid numeric.',
	'email': '%s is invalid Email.'
};

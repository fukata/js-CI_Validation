# jQuery CI_Validation Plugin
## What's this
jQuery plugin Form_validation based CodeIniger.

## How to
### Excecute validation
	var validator = new $.CI_Validation();
	validator.set_rules('email', 'input value', 'item label'
		,'required|max_length[10]|callback_custom_email'
		,{
		custom_email: function(str) {
			if (str === 'fukata@example.com') {
				return true;
			} else {
				this._set_error_message('email', 'Email is does not "fukata@example.com".');
				return false;
			}
		}
	});

### Add Basic Validators
	$.CI_Validation.prototype.validators = {
		required: function(str) {
			// ...
		},
		// ...
		// Your original rule
		hoge: function(str) {
		}
	};

# CI_Validation
## What's this
Form_validation based CodeIniger.

## How to
### Excecute validation
	var validator = new CI_Validation();
	validator.set_rules('email', 'item label'
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
	}).set_value('input value');
	// or call validator's set_value method 
	// validator.set_value('email', 'input value');
	
	if (!validator.run()) {
		for (var i in validator.errors) {
			$('#errors').append('<p>' + validator.errors[i] + '</p>');
		}
	}

### Add Basic Validators
	CI_Validation.prototype.validators = {
		required: function(str) {
			// ...
		},
		// ...
		// Your original rule
		hoge: function(str) {
		}
	};

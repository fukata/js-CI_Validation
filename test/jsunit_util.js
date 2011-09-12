function base_url() {
	var url = window.location.href;
	var idx = url.lastIndexOf('/');
	if (idx > 0) {
		url = url.substr(0, idx);
	} else {
		url = "";
	}
	return url;
}

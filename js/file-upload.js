(function(KM, document, $) {

	var maxAllowedSizeInMB = 1.5;
	var maxAllowedSize = maxAllowedSizeInMB * 1024 * 1024; //bytes
	var allowedTypes = [ 'png', 'jpg', 'jpeg', 'gif' ];
	var uploadUrl = 'uploadJobSeekerDocumentsAction.action';
	var files = new Array();

	/**
	 * 
	 */
	function ClearMessages(){
		
	}
	
	/**
	 * 
	 */
	ClearMessages.prototype.clear = function(){
		$(".error-message").hide();
		$(".success-message").hide();
	};
	
	/**
	 * 
	 */
	$(".bluebutton").click(function() {
		$(".success-message").hide();
		$(".error-message").hide();
		if (files == null || files.length == 0) {
			uploadError("Select the file to upload");
			return;
		}

		if (!validate()) {
			return;
		}

		for ( var i = 0; i < files.length; i++) {
			uploadFile(files[i], i);
		}
	});

	/**
	 * 
	 */
	function validate() {
		var flag = true;
		for ( var i = 0; i < files.length; i++) {
			var file = files[i];
			var vidType = file.name.split('.');
			//Validating file type
			if (allowedTypes.indexOf(vidType[vidType.length - 1].toLowerCase()) == -1) {
				uploadError("The selected file type:'" + vidType
						+ "' is not allowed to upload");
				flag = false;
				break;
			}
			//Validating file size
			if (file.size > maxAllowedSize) {
				uploadError("The selected file '" + file.name
						+ "' is of larger size than 1.5 MB");
				flag = false;
				break;
			}
		}
		if (flag) {
			console.log("Validation passed successfully...");
		} else {
			console.log("Validation failed...");
		}

		return flag;
	}

	/**
	 * 
	 */
	function uploadError(message) {
		$(".error-msg-txt").html(message);
		$(".error-message").show();
	}

	/**
	 * 
	 */
	function uploadSuccess(message) {
		$(".success-msg-txt").html(message);
		$(".success-message").show();
	}

	function uploadFile(file, index) {
		console.log("Uploading file : '" + file.name + "' to server");
		var fdata = new FormData();
		fdata.append('files', file);
		fdata.append("filename", file.name);
		fdata.append("contentType", file.type);

		var request = new XMLHttpRequest();
		request
				.addEventListener(
						"progress",
						function(evt) {
							if (evt.lengthComputable) {
								var percentComplete = Math.round(evt.loaded
										* 100 / evt.total);
								$("#upload-percent-" + index).html(
										percentComplete + '%');
								$("#upload-status-" + index).width(
										percentComplete + '%');
							} else {
								document.getElementById('upload-status-'
										+ index).innerHTML = 'Unable to compute';
							}
						});
		request.addEventListener("load", uploadComplete);
		request.addEventListener("error", uploadFailed);
		request.addEventListener("abort", uploadCanceled);
		request.open('POST', uploadUrl, true);
		request.send(fdata);
	}

	function uploadComplete(evt) {
		uploadSuccess("You have successfully uploaded the documents");
	}

	function uploadFailed(evt) {
		uploadError("There was an error attempting to upload the file.");
	}

	function uploadCanceled(evt) {
		uploadError("The upload has been canceled by the user or the browser dropped the connection.");
	}
	
	function initFiles(input){
		for ( var i = 0; i < input.files.length; i++) {
			files[i] = input.files[i];
		}
	}

	$(function() {
		$("input:file").change(function() {
			var clearMsg = new ClearMessages();
			clearMsg.clear();
			initFiles(this);
			var xindex = 0;
			$("#selected-files-all").html("");
			for ( var i = 0; i < files.length; i++) {
				var file = files[i];
				var fileReader = new FileReader();
				fileReader.onload = function(event) {
					loadImage(xindex, event);
					xindex++;
				};
				fileReader.readAsDataURL(file);
				loadUI(file, i);
			}
		});
	});

	function loadImage(index, event) {
		$("#upload-preview-" + index).attr("src", event.target.result);
	}

	function createRemoveFile(parentDiv, xindex) {
		var removeDiv = document.createElement("div");
		removeDiv.setAttribute("id", "remove-div-" + xindex);
		removeDiv.setAttribute("class", "remove-div");
		removeDiv.setAttribute("onclick", "removeFile(" + xindex + ")");

		var removeImage = document.createElement("img");
		removeImage.setAttribute("src", "../images/delete-icon.gif");
		removeImage.setAttribute("height", "10px");
		removeImage.setAttribute("width", "10px");
		removeImage.setAttribute("class", "remove-image");
		removeDiv.appendChild(removeImage);
		parentDiv.appendChild(removeDiv);
	}

	function populateHtml(filename, filesizeInBytes, xindex) {
		$("#img-text-info-" + xindex).append(
				"Filename = " + filename + " <br/> " + "File size (Bytes) = "
						+ filesizeInBytes);
		$("#upload-status-txt-" + xindex).append("Upload Status:");
		$("#upload-percent-" + xindex).append("0%");
	}

	function loadUI(file, xindex) {
		var filesizeInBytes = file.size;
		var filename = file.name;
		var parentDiv = $("#selected-files-all");
		
		var parent_dynamic_div = document.createElement("div");
		parent_dynamic_div.setAttribute("id", "parent-dynamic-div-" + xindex);
		parent_dynamic_div.setAttribute("class", "parent-dynamic");
		
		var div_dynamic = document.createElement("div");
		div_dynamic.setAttribute("id", "dynamic-div-" + xindex);
		var dynamic_image = document.createElement("img");
		dynamic_image.setAttribute("id", "upload-preview-" + xindex);
		dynamic_image.setAttribute("height", "60");
		dynamic_image.setAttribute("width", "60");
		dynamic_image.setAttribute("class", "float-r padding-5");
		dynamic_image.setAttribute("src", "");
		var dynamic_image_info = document.createElement("div");
		dynamic_image_info.setAttribute("id", "dynamic-image-info-" + xindex);

		var img_text_info = document.createElement("div");
		img_text_info.setAttribute("id", "img-text-info-" + xindex);

		dynamic_image_info.appendChild(img_text_info);

		var img_upload_status = document.createElement("div");
		img_upload_status.setAttribute("class", "progress-bar");

		var img_upload_txt = document.createElement("div");
		img_upload_txt.setAttribute("class", "progress-txt");
		img_upload_txt.setAttribute("id", "upload-status-txt-" + xindex);

		img_upload_status.appendChild(img_upload_txt);

		var img_upload_progress_bar = document.createElement("div");
		img_upload_progress_bar.setAttribute("class", "progress");
		//img_upload_txt.setAttribute("id", "upload-status-txt-"+xindex);

		var upload_status = document.createElement("div");
		upload_status.setAttribute("class", "upload-progress-status");
		upload_status.setAttribute("id", "upload-status-" + xindex);

		var upload_percent = document.createElement("div");
		upload_percent.setAttribute("class", "upload-progress-percent");
		upload_percent.setAttribute("id", "upload-percent-" + xindex);

		upload_status.appendChild(upload_percent);
		img_upload_progress_bar.appendChild(upload_status);

		img_upload_status.appendChild(img_upload_progress_bar);
		dynamic_image_info.appendChild(img_upload_status);

		dynamic_image.setAttribute("class", "float-l padding-5");
		div_dynamic.setAttribute("class", "selected-files-info");
		
		div_dynamic.appendChild(dynamic_image);
		div_dynamic.appendChild(dynamic_image_info);

		parent_dynamic_div.appendChild(div_dynamic);
		
		createRemoveFile(parent_dynamic_div, xindex);
		
		parentDiv.append(parent_dynamic_div);
		
		populateHtml(filename, filesizeInBytes, xindex);
	}

	function RemoveFile() {
		console.log("Remove file initialized successfully...");
	}

	RemoveFile.prototype.remove = function(index) {
		files.splice(index, 1);
		$("#parent-dynamic-div-" + index).hide();
	};

	window.RemoveFile = RemoveFile;
	window.ClearMessages = ClearMessages;

})(window["KM"] || {}, document, jQuery);

var removefile = new RemoveFile();

var clrMsg = new ClearMessages();
clrMsg.clear();

function removeFile(index) {
	removefile.remove(index);
}
$(document).ready(function(){
  $('[data-toggle="popover"]').popover({ trigger: "hover" });
  // if list_id in url, click the panel-header to un-collapse it and change the plus to minus
  if(window.location.hash) {
    var hash = window.location.hash.substring(1)
    // Only try to open panels if the hash is a number
    if(!isNaN(hash)) {
      $('#panel-heading-' + hash).click()
      setTimeout(function(){
        $('#l-' + hash + ' #new-item-name').focus();
      }, 1);
    }
  }
});
$('.edit-item-in-pantry-button').click(function(e){
  var item_id = this.dataset.itemid;
  var list_id = this.dataset.listid;
  // hide pantry button
  $('#add-item-to-pantry-button-' + item_id + '-' + list_id).hide();
  // show scan barcode button
  $('#scan-barcode-button-' + item_id + '-' + list_id).removeClass('hidden');
  // init datepicker for last_purchased
  var picker1 = new Pikaday({
    field: $('#edit-item-in-pantry-form-' + item_id + '-' + list_id + ' #datepicker-last-purchased')[0],
    format: 'MM/DD/YYYY',
  });
  $('#edit-item-in-pantry-form-' + item_id + ' #datepicker-last-purchased').val($.datepicker.formatDate('mm/dd/yy', new Date()));
  // init datepicker for expiration_date
  var picker2 = new Pikaday({
    field: $('#edit-item-in-pantry-form-' + item_id + '-' + list_id + ' #datepicker-exp-date')[0],
    format: 'MM/DD/YYYY',
  });
});
$('.edit-item-in-pantry-button').click(function() {
  var list_id = this.dataset.listid;
  var item_id = this.dataset.itemid;
  console.log("CLICKED ITEM "+item_id+" LIST "+list_id)
  $('#edit-item-in-pantry-form-' + item_id + '-' + list_id).removeClass('hidden')
});
$('.panel-heading').click(function() {
  var list_id = this.dataset.listid;
  // If collapsed, change plus to minus
  if($('#panel-body-' + list_id).hasClass('collapse')) {
    $('#' + list_id + '-collapse-indicator').removeClass('fa-plus')
    $('#' + list_id + '-collapse-indicator').addClass('fa-minus')
  }
  // change minus to plus
  else {
    $('#' + list_id + '-collapse-indicator').removeClass('fa-minus')
    $('#' + list_id + '-collapse-indicator').addClass('fa-plus')
  }
  $('#panel-body-' + list_id).toggleClass('collapse in');
});
// Show the user a confirmation form so they don't accidentally delete their lists
$('.delete-list-button').click(function() {
  var list_id = this.dataset.listid;
  // Hide the initial delete button
  $('#delete-list-' + list_id).addClass('hidden');
  // Show confirmation form
  $('#delete-list-confirmation-form-' + list_id).removeClass('hidden');
});
// Hide the confirmation form when the user presses the don't delete button
$('.delete-list-cancel-button').click(function() {
  var list_id = this.dataset.listid;
  // Hide confirmation form
  $('#delete-list-confirmation-form-' + list_id).addClass('hidden');
  // Show initial delete button
  $('#delete-list-' + list_id).removeClass('hidden');
});

function query_api(ids, code) {
  if(ids && ids.length > 1) edit_item_query(ids, code);
  else new_item_query(ids[0], code);
};

function new_item_query(id, code) {
  var button = $('#scan-barcode-button-new-item-' + id);
  
  $.get("/lists/walapi2", {"upc": code}, "json")
    .done(function(data) { //success
      $(button).removeClass("btn-warning", 1000).addClass("btn-success");
      var node= $(button).siblings("input[id*='name']");
      $(node).val(data.item_name);
      node = $(button).siblings("input[id*='desc']");
      $(node).val(data.item_desc);
      $("span#message-" + id).removeClass("alert-danger alert-success")
        .addClass("alert alert-success")
        .html("<strong>SUCCESS</strong>&nbsp;: Barcode scan found item information.");
    })
    .fail(function(data) {
      $(button).removeClass("btn-warning", 1000).addClass("btn-danger");
      $("span#'message-" + id).removeClass("alert-danger alert-success")
        .addClass("alert alert-danger")
        .html("<strong>ERROR</strong>&nbsp;: Barcode scan did not find item information.");
    });
};

function edit_item_query(ids, code) {
  var attrs = ['price', 'unit'],
      form = $("#edit-item-in-pantry-form-" + ids[0] + '-' + ids[1]);
  
  $.get("/lists/walapi2", {"upc": code, "attrs": JSON.stringify(attrs)}, "json")
    .done(function(data) { //success
      $('#scan-barcode-button-' + ids[0] + '-' + ids[1]).removeClass("btn-warning", 1000).addClass("btn-success");
      var node = $(form).find("input[id*='name']");
      $(node).val(data.item_name);
      node = $(form).find("input[id*='desc']");
      if(data.desc && data.desc != "") $(node).val(data.item_desc);
      node = $(form).find("input[id*='unit']");
      if(data.unit && data.unit != "") $(node).val(data.unit);
      node = $(form).find("input[id*='cost']");
      if(data.price && data.price != "") $(node).val(data.price);
      $("span[id*='message-" + ids[1] + "']").removeClass("alert-danger alert-success")
        .addClass("alert alert-success")
        .html("<strong>SUCCESS</strong>&nbsp;: Barcode scan found item information.");
    })
    .fail(function(data) {
      $(button).removeClass("btn-warning", 1000).addClass("btn-danger");
      $("span[id*='message-" + ids[1] + "']").removeClass("alert-danger alert-success")
        .addClass("alert alert-danger")
        .html("<strong>ERROR</strong>&nbsp;: Barcode scan did not find item information.");
    });
};

function misread(ids, result) {
  var button = "", message = "";

  if(ids.length > 1) {
    button = $("#scan-barcode-button-" + ids[0] + "-" + ids[1]);
    message = $("span[id*='message-" + ids[1] + "']");
  }
  else {
    button = $('#scan-barcode-button-new-item-' + ids[0]);
    message = $("span[id*='message-" + ids[0] + "']");
  }

  if(!result || !result.codeResult) {
    $(button).removeClass("btn-warning", 1000).addClass("btn-danger");
    $(message).removeClass("alert-danger alert-success")
      .addClass("alert alert-danger")
      .html("<strong>ERROR</strong>&nbsp;: Barcode scan failed. Unable to determine barcode value. Please try again.");
  }
}

$(".fa-barcode").on("click", function(e) {
  var input = $(this).find('input[type=file]')[0];
  $(input).context.click();
  $(".fa-barcode").removeClass('btn-danger btn-success').addClass('btn-warning');
});

$("span[id*='scan-barcode-button-new-item']").on("click", function(e) {
  $(this).siblings("input[id*='name']").val("");
  $(this).siblings("input[id*='desc']").val("");
});

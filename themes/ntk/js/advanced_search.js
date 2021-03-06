/*global addSearchString, deleteSearchGroupString, searchFields, searchJoins, searchLabel, searchMatch */

var nextGroup = 0;

function addSearch(group, term, field)
{
  // Does anyone use this???
  if (term  == undefined) {term  = '';}
  if (field == undefined) {field = '';}

  // Build the new search
  var inputIndex = $('#group'+group+' input').length;
  var inputID = group+'_'+inputIndex;
  var newSearch = '<div class="search form-inline"><div class="form-group form-group-lg"><input id="search_lookfor'+inputID+'" class="form-control" type="text" name="lookfor'+group+'[]" value="'+term+'"/>'
    + '</div><div class="form-group"><select id="search_type'+inputID+'" name="type'+group+'[]" class="form-control">';
  for (var key in searchFields) {
    newSearch += '<option value="' + key + '"';
    if (key == field) {
      newSearch += ' selected="selected"';
    }
    newSearch += ">" + searchFields[key] + "</option>";
  }
  newSearch += '</select></div><a class="form-field-delete glyphicon glyphicon-remove-circle';
  if(inputIndex == 0) {
    newSearch += ' hidden';
  }
  newSearch += '" href="#" onClick="deleteSearch('+group+','+inputIndex+')" ></a>';

  // Insert it
  $("#group" + group + "Holder").before(newSearch);
  // Show x if we have more than one search inputs
  if(inputIndex > 0) {
    $('#group'+group+' .search .delete').removeClass('hidden');
  }
}

function deleteSearch(group, eq)
{
  var searches = $('#group'+group+' .search');
  for(var i=eq;i<searches.length-1;i++) {
    $(searches[i]).find('input').val($(searches[i+1]).find('input').val());
    var select0 = $(searches[i]).find('select')[0];
    var select1 = $(searches[i+1]).find('select')[0];
    select0.selectedIndex = select1.selectedIndex;
  }
  if($('#group'+group+' .search').length > 1) {
    $('#group'+group+' .search:last').remove();
  }
  // Hide x
  if($('#group'+group+' .search').length == 1) {
    $('#group'+group+' .search .delete').addClass('hidden');
  }
}

function addGroup(firstTerm, firstField, join)
{
  if (firstTerm  == undefined) {firstTerm  = '';}
  if (firstField == undefined) {firstField = '';}
  if (join       == undefined) {join       = '';}

  var newGroup = '<div id="group'+nextGroup+'" class="group">'
    + '<div class="group-header row"><div class="col-md-3"><label class="help-block">'+searchLabel+':</label></div>'
    + '<div class="col-md-9 text-right"><a href="#" onClick="deleteGroup('+nextGroup+')" class="btn btn-sm btn-link delete" title="'+deleteSearchGroupString+'"><i class="glyphicon glyphicon-minus-sign"></i> '+deleteSearchGroupString+'</a></div></div><div class="row"><div class="col-xs-12"><i class="hidden" id="group'+nextGroup+'Holder" class="fa fa-plus-circle"></i> <a class="btn btn-sm btn-link" href="#" onClick="addSearch('+nextGroup+')"><i id="group'+nextGroup+'Holder" class="fa fa-plus-circle"></i> '+addSearchString+'</a>'
    + '<div class="group-options form-inline"><div class="form-group">'
    + '<label for="search_bool'+nextGroup+'">'+searchMatch+':&nbsp;</label>'
    + '<select id="search_bool'+nextGroup+'" name="bool'+nextGroup+'[]" class="form-control">'
    + '<option value="AND"';
  if(join == 'AND') {
    newGroup += ' selected';
  }
  newGroup += '>' +searchJoins['AND'] + '</option>'
    + '<option value="OR"';
  if(join == 'OR') {
    newGroup += ' selected';
  }
  newGroup += '>' +searchJoins['OR'] + '</option>'
    + '<option value="NOT"';
  if(join == 'NOT') {
    newGroup += ' selected';
  }
  newGroup += '>' +searchJoins['NOT'] + '</option>'
    + '</select></div></div></div></div>';

  $('#groupPlaceHolder').before(newGroup);
  addSearch(nextGroup, firstTerm, firstField);
  // Show join menu
  if($('.group').length > 1) {
    $('#groupJoin').removeClass('hidden');
    // Show x
    $('.group .close').removeClass('hidden');
  }
  return nextGroup++;
}

function deleteGroup(group)
{
  // Find the group and remove it
  $("#group" + group).remove();
  // If the last group was removed, add an empty group
  if($('.group').length == 0) {
    addGroup();
  } else if($('.group').length == 1) { // Hide join menu
    $('#groupJoin').addClass('hidden');
    // Hide x
    $('.group .close').addClass('hidden');
  }
}

// Fired by onclick event
function deleteGroupJS(group)
{
  var groupNum = group.id.replace("delete_link_", "");
  deleteGroup(groupNum);
  return false;
}

// Fired by onclick event
function addSearchJS(group)
{
  var groupNum = group.id.replace("add_search_link_", "");
  addSearch(groupNum);
  return false;
}
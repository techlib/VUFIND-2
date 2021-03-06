/*global hierarchySettings, html_entity_decode, jqEscape, path, vufindString*/

var hierarchyID, recordID;
var baseTreeSearchFullURL;

function getRecord(recordID)
{
  $.ajax({
    url: path + '/Hierarchy/GetRecord?' + $.param({id: recordID}),
    dataType: 'html',
    success: function(response) {
      if (response) {
        $('#hierarchyRecord').html(html_entity_decode(response));
        // Remove the old path highlighting
        $('#hierarchyTree a').removeClass("jstree-highlight");
        // Add Current path highlighting
        var jsTreeNode = $(":input[value='"+recordID+"']").parent();
        jsTreeNode.children("a").addClass("jstree-highlight");
        jsTreeNode.parents("li").children("a").addClass("jstree-highlight");
      }
    }
  });
}

function changeNoResultLabel(display)
{
  if (display) {
    $("#treeSearchNoResults").removeClass('hidden');
  } else {
    $("#treeSearchNoResults").addClass('hidden');
  }
}

function changeLimitReachedLabel(display)
{
  if (display) {
    $("#treeSearchLimitReached").removeClass('hidden');
  } else {
    $("#treeSearchLimitReached").addClass('hidden');
  }
}

var searchAjax = false;
function doTreeSearch()
{
  $('#treeSearchLoadingImg').removeClass('hidden');
  var keyword = $("#treeSearchText").val();
  var type = $("#treeSearchType").val();
  if(keyword.length == 0) {
    $('#hierarchyTree').find('.jstree-search').removeClass('jstree-search');
    var tree = $('#hierarchyTree').jstree(true);
    tree.close_all();
    tree._open_to(recordID.replace(':', '-'));
    $('#treeSearchLoadingImg').addClass('hidden');
  } else {
    if(searchAjax) {
      searchAjax.abort();
    }
    searchAjax = $.ajax({
      "url" : path + '/Hierarchy/SearchTree?' + $.param({
        'lookfor': keyword,
        'hierarchyID': hierarchyID,
        'type': $("#treeSearchType").val()
      }) + "&format=true",
      'success': function(data) {
        if(data.results.length > 0) {
          $('#hierarchyTree').find('.jstree-search').removeClass('jstree-search');
          var tree = $('#hierarchyTree').jstree(true);
          tree.close_all();
          for(var i=data.results.length;i--;) {
            var id = data.results[i].replace(':', '-');
            tree._open_to(id);
          }
          for(var i=data.results.length;i--;) {
            var id = data.results[i].replace(':', '-');
            $('#hierarchyTree').find('#'+id).addClass('jstree-search');
          }
          changeNoResultLabel(false);
          changeLimitReachedLabel(data.limitReached);
        } else {
          changeNoResultLabel(true);
        }
        $('#treeSearchLoadingImg').addClass('hidden');
      }
    });
  }
}

function buildJSONNodes(xml)
{
  var jsonNode = [];
  $(xml).children('item').each(function() {
     var content = $(this).children('content');
     var id = content.children("name[class='JSTreeID']");
     var name = content.children('name[href]');
     jsonNode.push({
       'id': id.text().replace(':', '-'),
       'text': name.text(),
       'a_attr': {
         'href': name.attr('href')
       },
      'type': name.attr('href').match(/\/Collection\//) ? 'collection' : 'record',
       children: buildJSONNodes(this)
     });
  });
  return jsonNode;
}

$(document).ready(function()
{
  // Code for the search button
  hierarchyID = $("#hierarchyTree").find(".hiddenHierarchyId")[0].value;
  recordID = $("#hierarchyTree").find(".hiddenRecordId")[0].value;
  var parentElement = hierarchySettings.lightboxMode ? '#modal .modal-body' : '#hierarchyTree';
  var context = $("#hierarchyTree").find(".hiddenContext")[0].value;

  $("#hierarchyTree")
    .bind("ready.jstree", function (event, data) {
      var tree = $("#hierarchyTree").jstree(true);
      tree.select_node(recordID.replace(':', '-'));
      tree._open_to(recordID.replace(':', '-'));

      if (context == "Collection") {
        getRecord(recordID.replace('-', ':'));
      }

      $("#hierarchyTree").bind('select_node.jstree', function(e, data) {
        if (context == "Record") {
          window.location.href = data.node.a_attr.href;
        } else {
          getRecord(data.node.id.replace('-', ':'));
        }
      });

      // Scroll to the current record
      if (hierarchySettings.lightboxMode) {
        var offsetTop = $(parentElement).offset().top;
        $(parentElement).animate({
          scrollTop: $('.jstree-clicked').offset().top - offsetTop + $(parentElement).scrollTop() - 50
        }, 1500);
      }
    })
    .jstree({
      'plugins': ['search','types'],
      'core' : {
        'data' : function (obj, cb) {
          $.ajax({
            'url': path + '/Hierarchy/GetTree',
            'data': {
              'hierarchyID': hierarchyID,
              'id': recordID,
              'context': context,
              'mode': 'Tree'
            },
            'success': function(xml) {
              var nodes = buildJSONNodes($(xml).find('root'));
              cb.call(this, nodes);
            }
          })
        },
        'themes' : {
          'url': path + '/themes/bootstrap3/js/vendor/jsTree/themes/default/style.css'
        }
      },
      'types' : {
        'record': {
          'icon':'icon icon-file'
        },
        'collection': {
          'icon':'icon icon-folder-open'
        }
      }
    });

  $('#treeSearch').removeClass('hidden');
  $('#treeSearch [type=submit]').click(doTreeSearch);
  $('#treeSearchText').keyup(function (e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13 || $(this).val().length == 0) {
      doTreeSearch();
    }
  });
});

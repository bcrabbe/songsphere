
/* equivolent of addEventListener('load', start); in JQuery*/
$(function() {
  "use strict";

  var $container = $('#my-isotope').imagesLoaded( function() {
     // init
     $container.isotope({
        // options
        itemSelector: '.content-preview',
        layoutMode: 'masonry'
      });
   });

   // layout Isotope again after all images have loaded
   $container.imagesLoaded( function() {
      $container.isotope('layout');
   });

  //filter:
  function tagFilterer($container) {
    var $container = $container;
    var tagSelector = [];
    return { addTag: addTag };

    function addTag(newTag) {
      var separatedTags = newTag.split("# ");
      for(var i=0; i<separatedTags.length; ++i) {
        this.tagSelector[i] = separatedTags[i];
      }
      this.updateFilterForm();
      this.filterContent();
    }

    function updateFilterForm() {
       if(tagSelector.length) {
          var selector;
          for(var i=0; i<tagSelector.length; ++i) {
             selector = selector.concat("#");
             selector = selector.concat(tagSelector[i]);
             selector = selector.concat(" ");
          }
          $( "#form-tag-filter" ).val(selector);
       }
    }

    function filterContent() {
       var selector = "content-preview[data-tags~=' ";
       for(var i=0; i<tagSelector.length; ++i) {
          selector = selector.concat(tagSelector[i]);
          selector = selector.concat(" ");
       }
       selector = selector.concat("'");
       $container.isotope({ filter: slector });
    }

  }
  var tagFilterer = tagFilterer($container);

  $( "#btn-tag-filter" ).on( "click", tagFilterer.addTag( $( "#form-tag-filter" ).val() ) );


});


function tagFilterer($isotopeContainter) {
  var $container = $isotopeContainer;
  var tagSelector = [];
  return { addTag: addTag };

  function addTag(newTag) {
    var separatedTags = newTag.split("# ");
    for(var i=0; i<separatedTags.length; ++i) {
      this.tagSelector[i] = separatedTags[i];
    }
    this.updateFilterForm();
    this.filterContent();
  }

  function updateFilterForm() {
     if(tagSelector.length) {
        var selector;
        for(var i=0; i<tagSelector.length; ++i) {
           selector = selector.concat("#");
           selector = selector.concat(tagSelector[i]);
           selector = selector.concat(" ");
        }
        $( "#form-tag-filter" ).val(selector);
     }
  }

  function filterContent() {
     var selector = "content-preview[data-tags~=' ";
     for(var i=0; i<tagSelector.length; ++i) {
        selector = selector.concat(tagSelector[i]);
        selector = selector.concat(" ");
     }
     selector = selector.concat("'");
     $container.isotope({ filter: slector });
  }

}

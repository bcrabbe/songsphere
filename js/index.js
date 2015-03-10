X();
function X() {
  "use strict";
  addEventListener('load', start);

  function start() {
      var $isotopeContainer = $( "#my-isotope" );

      var myIsotope = buildMyIsotopeModule($isotopeContainer);
      myIsotope.repeatLayout();
      //filter:

      var tagFilterer = buildTagFiltererModule($isotopeContainer);
      $(window).on( 'hashchange', tagFilterer.onHashchange );
   //   $( "#btn-tag-filter" ).on( "click", tagFilterer.addTag( $( "#form-tag-filter" ).val() ) );
   }



   function buildMyIsotopeModule($container)
   {
      var $isotopeContainer = $container;
      $isotopeContainer.imagesLoaded(initIsotope());

      function initIsotope() {
         // init
          $container.isotope({
             // options
             itemSelector: '.content-preview',
             layoutMode: 'masonry'
          });
      }

      function repeatLayout() {
         $isotopeContainer.isotope('layout');
      }
      return { repeatLayout: repeatLayout };
   }


   function buildTagFiltererModule($container)
   {
      var $isotopeContainer = $container;

     var $btnTagFilter = $( "#btn-tag-filter" );
     var $formTagFilter = $( "#form-tag-filter" );

     return { onHashChange: onHashChange, onFormSubmit: onFormSubmit };



     function filterContent() {
        var selector = "content-preview[data-tags~=' ";
        for(var i=0; i<tagSelector.length; ++i) {
           selector = selector.concat(tagSelector[i]);
           selector = selector.concat(" ");
        }
        selector = selector.concat("'");
        $isotopeContainer.isotope({ filter: selector });
     }

     function getHashFilter() {
        var hash = location.hash;
        // get filter=filterName
        var matches = location.hash.match( /filter=([^&]+)/i );
        var hashFilter = matches && matches[1];
        return hashFilter && decodeURIComponent( hashFilter );
     }

     function onHashChange() {
        console.log("reached here with");
        var hashFilter = getHashFilter();
        if ( !hashFilter ) {
           return;
        }
        // filter isotope
        $isotopeContainer.isotope({
           filter: hashFilter
        });
        // set selected class on button
        if ( hashFilter ) {
           $filters.find('.is-checked').removeClass('is-checked');
           $filters.find('[data-filter="' + hashFilter + '"]').addClass('is-checked');
        }
     }

     function onFormSubmit() {
        formTagFilterValue = $formTagFilter.val();
        // set filter in hash
        location.hash = 'filter=' + encodeURIComponent( formTagFilterValue );
        onHashFilter();
     }

   }
}

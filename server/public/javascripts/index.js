X();
function X() {
  "use strict";
  addEventListener('load', start);

  function start() {
      var $isotopeContainer = $( "#my-isotope" );

      var myIsotope = buildMyIsotopeModule($isotopeContainer);
      myIsotope.repeatLayout();
      //filter:

     // var tagFilterer = buildTagFiltererModule($isotopeContainer);
      //$(window).on( 'hashchange', tagFilterer.onHashchange );
      // onload, if there was a fragment in the URL
     // window.location.hash && hashUpdate(window.location.hash);
   }

   function buildMyIsotopeModule($container)
   {
       var $isotopeContainer = $container;
       $isotopeContainer.imagesLoaded(initIsotope());
       return { repeatLayout: repeatLayout };

       function initIsotope() {
         // init
           $container.isotope({
               itemSelector: '.content-preview',
               layoutMode: 'masonry'
           });
       }

       function repeatLayout() {
           $isotopeContainer.isotope('layout');
       }
    }


   function buildTagFiltererModule($container)
   {
      var $isotopeContainer = $container;

      var $btnTagFilter = $( "#btn-tag-filter" );
      var $formTagFilter = $( "#form-tag-filter" );

      return { onHashChange: onHashChange, onFormSubmit: onFormSubmit };


     function getHashFilter() {
        var hash = location.hash;
        // get filter=filterName
        var matches = location.hash.match( /filter=([^&]+)/i );
        var hashFilter = matches && matches[1];
        return hashFilter && decodeURIComponent( hashFilter );
     }

     function onHashChange() {
        var hashFilter = getHashFilter();
        if ( !hashFilter ) {
           return;
        }
         $formTagFilter.val(hashFilter);
     }

     function onFormSubmit() {
        formTagFilterValue = $formTagFilter.val();
        // set filter in hash
        location.hash = '#filter=' + encodeURIComponent( formTagFilterValue );
        onHashChange();
     }

   }
}

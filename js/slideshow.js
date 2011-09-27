/**
 * slideshow.js - turns jQuery mobile into a presentation framework.
 */
(function($, undefined){

var
  
  // list of slides
  $slides = $('div[data-role="page"]'),
  
  // first slide
  $first = $slides.eq(0),
  
  // header and footer
  $header = $first.find('div[data-role="header"]'),
  $footer = $first.find('div[data-role="footer"]'),
  
  // next/prev buttons
  $next = $('<a data-icon="arrow-r" class="ui-btn-right" data-iconpos="notext">next</a>'),
  $prev = $('<a data-icon="arrow-l" class="ui-btn-left" data-iconpos="notext" data-direction="reverse">prev</a>'),
  $home = $('<a href="#welcome" data-icon="home" data-iconpos="notext">home</a>')
    .css({
      'float': 'left',
      'margin': '0.5em'
    }),
  $menu = $('<a href="#menu" data-icon="grid" data-iconpos="notext" data-rel="dialog">menu</a>')
    .css({
      'float': 'right',
      'margin': '0.5em'
    }),
  
  // menu slide
  $menuslide = $('<div data-role="page" id="menu"></div>')
    .append('<div data-role="header"><h1>menu</h1></div>')
    .append('<div data-role="content" data-theme="c"></div>')
    .appendTo('body'),
  $menucontent = $menuslide
    .find('div[data-role="content"]');

// normalize slides for jquery-mobile
$slides
  .attr('data-role', 'page')
  .each(function (index, slide){
    var
      $slide = $(slide);
    $slide
      .addClass('slide-' + slide.id);
    $menucontent
      .append(
        $('<a data-role="button" data-icon="arrow-r" data-iconpos="right"></a>')
          .attr('href', '#' + $slide.attr('id'))
          .text(
            $slide
              .find('div[data-role="content"]')
                .find('h1, h2, h3, h4, h5, h6')
                  .eq(0)
                    .text()
          )
      );
  });

// copy header and footer to all slides
$slides
  .slice(1)
    .each(function (index, slide) {
      $(slide)
        .prepend($header.clone())
        .append($footer.clone());
    });

// create 'next' and 'prev' buttons for navigation
$slides
  .each(function (index, page) {
    var
      $page = $(page),
      $h = $page
        .find('div[data-role="header"]')
          .eq(0),
      $f = $page
        .find('div[data-role="footer"]')
          .eq(0);
    
    if (index > 0) {
      $h.prepend(
        $prev
          .clone()
            .attr('href', '#' + $slides.eq(index - 1).attr('id'))
      );
    }
    $f
      .prepend($home.clone())
      .prepend($menu.clone());
    if (index < $slides.length - 1) {
      $h.prepend(
        $next
          .clone()
            .attr('href', '#' + $slides.eq(index + 1).attr('id'))
      );
    }
         
  });

})(jQuery);

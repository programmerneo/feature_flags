/* comet v2.35.0 */
/* DO NOT EDIT: The contents of this file are dynamically generated and will be overwritten */
Comet = Comet || {};

Comet.Utils = function() {
    "use strict";

    return {

        "debounceFunction": function(func, wait) {
            // func: function to be debounced
            // wait: debounce time in milliseconds
            var timeout = null;

            return function() {
                var later = function() {
                    timeout = null;
                    func();
                };

                var callNow = !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);

                if (callNow) {
                    func();
                }
            };
        },

        "hasScrollBar": function(el) {
            return el.get(0).scrollHeight > el.innerHeight();
        }
    };
}();

var Comet = Comet || {};

Comet.DropdownMenu = function() {
    'use strict';
    var triggerMenuVisibleClass = "comet-dropdown-trigger--menu-visible",
        baseTriggerMenuVisibleClass = triggerMenuVisibleClass,
        dropdownTriggerClass = "js-comet-dropdown-trigger";

    function isDropdownTrigger(target) {
        return $(target).hasClass(dropdownTriggerClass) || $(target).closest("." + dropdownTriggerClass).length > 0;
    };

    function setAllTriggersInactive() {
        $("." + baseTriggerMenuVisibleClass).removeClass(triggerMenuVisibleClass);
    }

    function toggleDropdownMenu($dropdownTrigger) {
        var $dropdown = $("#" + $dropdownTrigger.attr("data-comet-popover"));
        setAllTriggersInactive();

        if ($dropdown.hasClass("visible")) {
            $dropdownTrigger.removeClass(triggerMenuVisibleClass);
            $dropdown.trigger("hide");
        } else {
            $dropdownTrigger.addClass(triggerMenuVisibleClass);
            $dropdown.trigger("show", { "el": $dropdownTrigger[0] });
        }
    };

    function setEventListeners($dropdownTrigger) {
        $dropdownTrigger.off("click").on("click", function(e){
            e.preventDefault();
            toggleDropdownMenu($(this));
        });

        $(document).on("click touchend", function(event) {
            if (!isDropdownTrigger(event.target)) {
                setAllTriggersInactive();
            }
        });
    };

    var initialize = function initialize() {
        $("." + dropdownTriggerClass).each(function(){
            if ($(this).hasClass("comet-button")) {
                triggerMenuVisibleClass += " comet-button--active comet-button--hover"; //If the trigger for a dropdown is a Comet button, add the comet-button--active class while the dropdown is visible
            }
            setEventListeners($(this));
        });
    };

    var publicVars = {
        'initialize': initialize
    };

    return publicVars;
}();

$(document).ready(function(){
    'use strict';
    Comet.DropdownMenu.initialize();
});

var Comet = Comet || {};

Comet.GlobalNavBar = function() {
    'use strict';
    var moreNavVisibleClass = "comet-global-nav-bar--more-nav-expanded",
        globalNavBarCustomizationEnabledClass = "comet-page-shell--global-nav-bar-customizing";


    function setActiveState($globalNav) {
        var filename = /[^/]*$/.exec(window.location.pathname)[0];
        $globalNav.find("a[href$='" + filename + "']").closest(".comet-global-nav-bar__item").addClass("comet-global-nav-bar__item--selected comet-list-group__row--selected");
    }

    function setEventListeners($globalNav) {
        $globalNav.on("click", ".js-comet-global-nav-bar__more-nav-trigger", function(e){
            e.preventDefault();
            if ($globalNav.hasClass(moreNavVisibleClass)) {
                $globalNav.removeClass(moreNavVisibleClass);
            } else {
                $globalNav.addClass(moreNavVisibleClass);
            }
        });

        $globalNav.on("click", ".js-comet-global-nav-bar__customization-toggle", function(e){
            e.preventDefault();
            toggleCustomizationMode();
        });

        $globalNav.on("click", ".js-comet-global-nav-bar__reset-menu", function(e){
            e.preventDefault();
            // Trigger the confirmation modal
            toggleCustomizationMode();
        });

        $globalNav.on("click", ".js-comet-global-nav-bar__save-nav-order", function(e){
            e.preventDefault();
            // Save current nav order for user
            toggleCustomizationMode();
        });

        $globalNav.on("click", ".js-comet-global-nav-bar__cancel-nav-order", function(e){
            e.preventDefault();
            // Revert back to nav order from the start of customization mode
            toggleCustomizationMode();
        });

        $globalNav.on("mouseleave", function(e){
            $(document).trigger("comet-collapse-global-nav-bar");
        });

        $(document).on("click", "." + globalNavBarCustomizationEnabledClass + " .comet-global-nav-bar__link", function(e){
            e.preventDefault(); // Prevent nav links from functioning when customization mode is active
        });
    }

    function toggleCustomizationMode() {
        $(document).trigger("comet-toggle-global-nav-bar-customization-mode");
        toggleSortableHandles();
    }

    function navSortStart($globalNav) {
        $(document).trigger("comet-global-nav-bar-sort-start");
    }

    function navSortStop($globalNav) {
        $(document).trigger("comet-global-nav-bar-sort-end");
        $globalNav.find(".comet-global-nav-bar__item").removeAttr("style");
        // This is where the new nav order would be saved to some persistent data layer
    }

    function toggleSortableHandles() {
        // Check for presence of class on page shell, but doesn't add or remove the class, that's the page shell's responsibility
        if ($(".comet-page-shell").hasClass(globalNavBarCustomizationEnabledClass)) {
            // Allow entire nav item to be draggable target
            enableSortableBehavior($(".comet-global-nav-bar"), false);
        } else {
            // Only allow reordering if the grip handle is clicked directly
            enableSortableBehavior($(".comet-global-nav-bar"), true);
        }
    }

    function enableSortableBehavior($globalNav, gripHandlesOnly) {
        var gripHandlesOnly = typeof gripHandlesOnly === 'undefined' ? true : gripHandlesOnly,
            sortableOptions = {
                "axis": "y",
                "containment": ".js-comet-global-nav-bar",
                "cursor": "grabbing",
                "connectWith": ".js-comet-global-nav-bar__items--sortable",
                "handle": ".comet-global-nav-bar__customize-sortable-target",
                "items": ".comet-global-nav-bar__item--draggable",
                "placeholder": "comet-global-nav-bar__item-sort-placeholder",
                "start": function(event, ui) {
                    ui.item.addClass("comet-global-nav-bar__item--sorting");
                    navSortStart($globalNav);
                },
                "stop": function(event, ui) {
                    ui.item.removeClass("comet-global-nav-bar__item--sorting");
                    navSortStop($globalNav);
                }
            },
            moreHiddenDropzoneOptions = sortableOptions;

        if (gripHandlesOnly) {
            sortableOptions.handle = ".comet-global-nav-bar__item-grip-wrap";
        }

        $globalNav.find(".ui-sortable").each(function(){
            // Unbind the sortable so it can be recreated
            $(this).sortable("destroy");
        });


        $globalNav.find(".js-comet-global-nav-bar__items--more").sortable(sortableOptions);
        $globalNav.find(".js-comet-global-nav-bar__items--primary").sortable(sortableOptions);

        // If items are moved to the "More Products & Services" dropzone when "More Products & Services" is collapsed, then append the dropped item to the end of the "More Products & Services" list
        moreHiddenDropzoneOptions.receive = function(event, ui) {
            ui.item.appendTo($(".js-comet-global-nav-bar__items--more"));
        };
        $globalNav.find(".js-comet-global-nav-bar__items--more-hidden-dropzone").sortable(moreHiddenDropzoneOptions);
    }

    var initialize = function initialize() {
        $(".js-comet-global-nav-bar").each(function(){
            setActiveState($(this));
            setEventListeners($(this));
            enableSortableBehavior($(this));
        });
    };

    var publicVars = {
        'initialize': initialize
    };

    return publicVars;
}();


$(document).ready(function(){
    'use strict';
    Comet.GlobalNavBar.initialize();
});

var Comet = Comet || {};

Comet.Modal = function() {
    'use strict';

    var $overlay,
        $modal,
        $closeButton,
        $lastFocus,
        takeover = false;

    var openInModal = function(target) {
        // target: thing to be opened in modal
        var $content = $('#' + target).clone().attr('id', target + "-clone");

        takeover = $content[0].className.indexOf('comet-modal--takeover') >= 0 ? true : false;

        // fire custom event
        $('body').trigger('comet.modal.begin');
        // add class to body to identify a modal is open
        $('body').addClass('comet-modal-open');
        // add overlay to page

        generateModal($content);
        attachCloseEvents();
    };

    var generateModal = function(content) {

        // Create modal base objects
        var $modalOverlay = $('<div class="comet-modal-overlay js-comet-modal-overlay" role="dialog"></div>'),
            $modalContainer = $('<div class="comet-modal js-comet-modal" role="document"></div>');

        // insert content into modal container
        content.appendTo($modalContainer);

        if (takeover) {
            $modalOverlay.addClass('comet-modal-overlay--takeover');
            $modalContainer.appendTo($modalOverlay);
            $modalOverlay.prepend('<button class="comet-button comet-button--flat comet-button--icon comet-modal__button--takeover-close js-comet-modal__close-button" aria-label="Close Modal"><svg class="comet-button--icon__icon comet-icon--l"><use xlink:href="/comet/comet_assets/comet.svg#x"></use></svg></button>');
            $('body').append($modalOverlay);
            $modal = $('.js-comet-modal-overlay');
        } else {
            $modalOverlay.addClass('comet-modal-overlay--backdrop');
            $('body').append($modalOverlay);
            $('body').append($modalContainer);
            $modal = $('.js-comet-modal');
        }

        // resize modal in order to account for smaller screens for scrollable
        resizeModal();

        // define $overlay, $modal and $closeButton vars for closeModal()
        $overlay = $('.js-comet-modal-overlay');
        $closeButton = $('.js-comet-modal__close-button');

        $modal.attr('tabindex', '0');
        $modal.focus();

        // fire custom event
        $('body').trigger('comet.modal.generate');
    };

    var attachCloseEvents = function() {
        if (!takeover) {
            $overlay.on('click', closeModal);
        }

        $closeButton.on('click', closeModal);

        // Esc Key
        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                closeModal();
            }
        });
    };

    var attachOpenEvents = function(target) {

        var $selector = target ? $(target) : $('.js-modal-trigger');

        $selector.on('click', function() {
            var $modalTarget = $(this).data('target');
            $lastFocus = document.activeElement;
            openInModal($modalTarget);
        });
    };

    var closeModal = function() {
        $overlay.remove();
        $modal.remove();
        $lastFocus.focus();
        $('body').removeClass('comet-modal-open');

        // fire custom event
        $('body').trigger('comet.modal.close');
    };

    var resizeModal = function() {
        var $resizeModal = $('.js-comet-modal'),
            $modalInner = $resizeModal.find('.comet-modal__inner'),
            $modalContent = $resizeModal.find('.comet-modal__content'),
            $modalHeaderHeight = $resizeModal.find('.comet-modal__header').height(),
            $modalFooterHeight = $resizeModal.find('.comet-modal__footer').outerHeight(),
            availableHeight = document.body.clientHeight,
            $newHeight;

        if ($modalInner.length > 0) {
            $newHeight = availableHeight - ($modalHeaderHeight + $modalFooterHeight + 80); // 80 is for misc spacing and margins
            if ($newHeight > 775) { $newHeight = 775; }
            $modalContent.css('max-height', $newHeight);

            if (Comet.Utils.hasScrollBar($modalContent)) {
                $modalInner.addClass("comet-modal--scrollable");
            } else {
                $modalInner.removeClass("comet-modal--scrollable");
            }
        }
    };

    var initialize = function() {
        attachOpenEvents();

        $(window).resize(function() {
            if ($('.js-comet-modal').length > 0) {
                Comet.Utils.debounceFunction(resizeModal(), 200);
            }
        });
    };

    var public_vars = {
        'initialize': initialize,
        'openInModal': openInModal,
        'generateModal': generateModal,
        'closeModal': closeModal,
        'attachOpenEvents': attachOpenEvents,
        'attachCloseEvents': attachCloseEvents
    };

    return public_vars;
}();

$(document).ready(function() {
    "use strict";

    Comet.Modal.initialize();
});

var Comet = Comet || {};

Comet.PageShell = function() {
    'use strict';
        var globalNavBarVisibleClass = "comet-page-shell--global-nav-bar-visible",
            globalNavBarExpandedClass = "comet-page-shell--global-nav-bar-expanded",
            panelVisibleClass = "comet-page-shell--panel-visible",
            searchVisibleClass = "comet-page-shell__search-visible",
            globalNavBarSortingClass = "comet-page-shell--global-nav-bar-sorting",
            globalNavBarCustomizationEnabledClass = "comet-page-shell--global-nav-bar-customizing";

    function showGlobalNavBar() {
        $(".comet-page-shell").addClass(globalNavBarVisibleClass);
    }

    function hideGlobalNavBar() {
        $(".comet-page-shell").removeClass(globalNavBarVisibleClass);
    }

    function togglePanel() {
        if ($(".comet-page-shell").hasClass(panelVisibleClass)) {
            hidePanel();
        } else {
            showPanel();
        }
    }

    function showPanel() {
        $(".comet-page-shell").addClass(panelVisibleClass);
    }

    function hidePanel() {
        $(".comet-page-shell").removeClass(panelVisibleClass);
    }

    function toggleSearch() {
        if ($(".comet-page-shell").hasClass(searchVisibleClass)) {
            hideSearch();
        } else {
            showSearch();
        }
    }

    function showSearch() {
        $(".comet-page-shell").addClass(searchVisibleClass);
        $(event.target).closest('.comet-product-bar__action').find('.comet-product-bar__search-input').focus();
    }

    function hideSearch() {
        $(".comet-page-shell").removeClass(searchVisibleClass);
    }

    function expandGlobalNavBar() {
        if (!$(".comet-page-shell").hasClass(globalNavBarExpandedClass)) {
            $(".comet-page-shell").addClass(globalNavBarExpandedClass);
        }
    }

    function collapseGlobalNavBar() {
        // Don't collapse the global nav bar if it's being sorted
        if ($(".comet-page-shell").hasClass(globalNavBarExpandedClass) && !$(".comet-page-shell").hasClass(globalNavBarSortingClass)) {
            $(".comet-page-shell").removeClass(globalNavBarExpandedClass);
        }
    }

    function toggleGlobalNavBarCustomizationMode() {
        if ($(".comet-page-shell").hasClass(globalNavBarCustomizationEnabledClass)) {
            $(".comet-page-shell").removeClass(globalNavBarCustomizationEnabledClass);
        } else {
            $(".comet-page-shell").addClass(globalNavBarCustomizationEnabledClass);
        }
    }

    function enableGlobalNavBarSortingMode() {
        $(".comet-page-shell").addClass(globalNavBarSortingClass); // Add a class so the nav isn't collapsed during sorting
    }

    function disableGlobalNavBarSortingMode() {
        $(".comet-page-shell").removeClass(globalNavBarSortingClass); // Remove class so the nav will collapse as normal
    }

    function setEventListeners() {
        $(document).on("comet-show-global-nav-bar", showGlobalNavBar);

        $(document).on("comet-product-bar-toggle-panel", togglePanel);

        $(document).on("comet-product-bar-toggle-search", toggleSearch);

        $(document).on("comet-global-nav-bar-sort-start", enableGlobalNavBarSortingMode);

        $(document).on("comet-global-nav-bar-sort-end", disableGlobalNavBarSortingMode);

        $(document).on("comet-toggle-global-nav-bar-customization-mode", toggleGlobalNavBarCustomizationMode);

        $(document).on("comet-expand-global-nav-bar", expandGlobalNavBar);

        $(document).on("comet-collapse-global-nav-bar", collapseGlobalNavBar);

        $(document).on("touchend", "." + globalNavBarExpandedClass + " .comet-page-shell__product-well", function(e){
            e.preventDefault();
            e.stopPropagation();
            collapseGlobalNavBar();
        });

        $(".comet-page-shell__global-nav-bar-touch-overlay").on("mouseenter", expandGlobalNavBar);

        $(".js-comet-page-shell__global-nav-bar *").on("focusin", expandGlobalNavBar);

        $(".js-comet-page-shell__global-nav-bar").on("mouseleave", collapseGlobalNavBar);

        $(".js-comet-page-shell__global-nav-bar *").on("focusout", collapseGlobalNavBar);

        $(".comet-page-shell__global-nav-bar-touch-overlay").on("touchend", function(e){
            e.preventDefault();
            e.stopPropagation();
            expandGlobalNavBar();
        });

        $(".js-comet-page-shell__close-global-nav-bar").on("click", function(e){
            e.preventDefault();
            hideGlobalNavBar();
        });

        $(".js-comet-page-shell__product-well-overlay").on("click", function(e){
            e.preventDefault();
            if ($("." + globalNavBarCustomizationEnabledClass).length === 0) { // If "customize" mode isn't enabled allow clicks on the overlay to close the global nav
                hideGlobalNavBar();
            }
        });

        $(".js-comet-page-shell__close-panel").on("click", function(e){
            e.preventDefault();
            hidePanel();
        });
    }

    var initialize = function initialize() {
        setEventListeners();
    };

    var publicVars = {
        'initialize': initialize
    };

    return publicVars;
}();


$(document).ready(function(){
    'use strict';
    Comet.PageShell.initialize();
});

Comet.Popovers = function() {

    "use strict";

    var el;
    var $el;
    var isTooltip;
    var elTitle;
    var debouncedEls = [];  // debounce variable case of click then focus
    var nubSideLength = 12;
    var nubSpacing = 0; // space between nub and target element in px
    var nubEdgeOffset = 6; //distace offset from the edge of the tooltip
    var nubBaseLength = nubSideLength * Math.sqrt(2);
    var nubHeight = nubBaseLength / 2;
    var defaultTooltipPlacement = "top"; // default to comet-tooltip--top if no placement is specified
    var defaultPopoverPlacement = "bottom"; // default to comet-popover--bottom if no placement is specified

    var myHorizontal;  // horizontal alignment of tooltip with target element
    var myVertical;  // vertical alignment of tooltip with target element
    var atHorizontal; // horizontal position on target element tooltip is aligned with
    var atVertical; // vertical position on target element tooltip is aligned with

    var directions = ["top", "right", "bottom", "left"];

    var initialize = function(event, initializeTooltips) {
        // TODO: fix multiple initializations
        deactivateExistingPopovers(initializeTooltips);

        if (initializeTooltips) {
            // initialize tooltips only
            $('.js-comet-tooltip-trigger, *[data-comet-tooltip-text]').on("mouseenter mouseleave focus blur", triggerPopoverEvent);
        } else {
            // initialize general popovers only
            $('.js-comet-popover-trigger').each(function() {
                var isHover = $(this).data("comet-popover-event") === "hover";
                var events = isHover ? "mouseenter mouseleave" : "click focus";
                $(this).on(events, triggerPopoverEvent);
            });

            $('.comet-popover').on("show hide", handlePopoverTrigger);
            $('body').on("show hide", ".comet-tooltip__content", handlePopoverTrigger);
        }

        listenForClickAway();
        listenForEscKeyPress();
        listenForResize();
    };

    var deactivateExistingPopovers = function(initializeTooltips) {
        if (initializeTooltips) {
            $('.js-comet-tooltip-trigger, *[data-comet-tooltip-text]').off("mouseenter mouseleave focus blur"); //remove listeners if already initialized
            $('.comet-tooltip__content').remove();
        } else {
            $('.js-comet-popover-trigger').off();
        }
    };

    var triggerPopoverEvent = function(event) {
        event.stopPropagation();
        var $popover;

        isTooltip = !!$(this).data("comet-tooltip-text");
        var debounce = event.type !== "mouseenter";

        var eventOpts = {
            "el": event.currentTarget,
            "debounce": debounce
        };

        var tooltipEvents = ["mouseenter", "mouseleave", "focus", "blur"];

        if (isTooltip && tooltipEvents.indexOf(event.type) !== -1) {

            if (!tooltipHasBeenRendered(this)) {
                renderTooltip(this);
            }

            $popover = getTooltipFromTarget(this);
        } else {
            var popoverId = $(this).data("comet-popover");
            $popover = $('#' + popoverId);
            // hide any tooltips
            $(this).find('.comet-tooltip__content').trigger("hide");
        }

        if (popoverIsVisible($popover)) {
            if (isTooltip && event.type === "mouseenter" || event.type === "focus") {
                return;  //tooltips should never hide on mouseenter or focus
            }
            $popover.trigger("hide", eventOpts);
        } else {
            if (isTooltip && event.type === "mouseleave" || event.type === "blur") {
                return;  //tooltips should never show on mouseleave or blur
            }
            $popover.trigger("show", eventOpts);
        }
    };

    var handlePopoverTrigger = function(event, opts) {
        opts = opts || {};
        el = opts.el || el;
        $el = $(el);
        var debounce = opts.debounce === void 0 ? true : opts.debounce;

        setTimeout(function() {
            debouncedEls = [];
        }, 200);

        if (debouncedEls.indexOf(this) === -1) {
            // prevent this element from accepting show and hide events for 200ms
            // this allows both focus and click events to fire and the show event
            // the tooltip is shown but not hidden
            if (debounce) {
                debouncedEls.push(this);
            }

            var $popover = $(this);

            if (event.type === "hide") {
                hidePopover($popover);
            } else if (event.type === "show") {
                showPopover($popover);
            }
        }
    };

    var popoverIsVisible = function($popover) {
        return $popover.hasClass("visible");
    };

    var listenForClickAway = function() {

        $(document).on("click touchend", function(event) {
            if (!isPopover(event.target)) {
                closeAllPopups();
            }
        });
    };

    var listenForEscKeyPress = function() {
        $(document).on("keyup", function(event) {
            var escKeyCode = 27;
            if (event.which === escKeyCode) {
                closeAllPopups();
            }
        });
    };

    var listenForResize = function() {
        $(window).on('resize', debouncedResizeHandler);
    };

    var resizeHandler = function() {
        repositionPopover();
    };

    var debouncedResizeHandler = Comet.Utils.debounceFunction(resizeHandler, 200);

    var repositionPopover = function() {
        var $visiblePopover = $('.comet-popover.visible');
        var visiblePopoverId = $visiblePopover.attr("id");
        var popoverTrigger = $('[data-comet-popover="' + visiblePopoverId + '"]').get(0);

        $visiblePopover.trigger("show", { "el": popoverTrigger, "debounce": false });
    };

    var closeAllPopups = function() {
        $('.comet-popover.visible, .comet-tooltip__content.visible').trigger("hide");
    };

    var isPopover = function(clickedEl) {
        return isOrHasParent(clickedEl, "comet-popover");
    };

    var isOrHasParent = function(clickedEl, className) {
        var selector = "." + className;
        return $(clickedEl).hasClass(className) || !!$(clickedEl).closest(selector).length;
    };

    var showPopover = function($popover) {
        if (!isTooltip) {
            // hide any showing popovers
            $('.comet-popover, .comet-tooltip__content').not($popover).trigger("hide");
        }

        removeTitleAttr(); // prevent native browser tooltip

        el.offsetHeight; //Forces a redraw so the tooltip is added in its invisible state before the "visible" class is added
        $popover.addClass("visible");
        $popover.removeAttr("aria-hidden");

        var positionInfo = getPositionInfo($popover);
        positionPopover($popover, positionInfo);
    };

    var removeTitleAttr = function() {
        elTitle = "";
        elTitle = $el.attr("title");

        if (elTitle) {
            $el.attr("title", "");
        }
    };

    var hidePopover = function($popover) {
        $popover.removeClass("visible");
        $popover.attr("aria-hidden", "true");
        addTitleAttr(); // add title back for accessibility
    };

    var addTitleAttr = function() {
        if (elTitle) {
            $el.attr("title", elTitle);
        }
    };

    var tooltipHasBeenRendered = function(targetEl) {
        return !!getTooltipFromTarget(targetEl).length;
    };

    var getTooltipFromTarget = function(targetEl) {
        var tooltipId = $(targetEl).attr("aria-describedby");
        return $(targetEl).siblings("#" + tooltipId);
    };

    var renderTooltip = function(targetEl) {

        var tooltipId = generateTooltipId();

        var placementClass = "comet-tooltip__content" + getPlacementVariation(targetEl);

        $(targetEl).after('<div class="comet-tooltip__content ' + placementClass + '" id="' + tooltipId + '" role="tooltip"><span class="comet-tooltip__nub"></span><span class="comet-tooltip__text">' + $(targetEl).data("comet-tooltip-text") + '</span></div>');

        setAriaDescribedBy(targetEl, tooltipId);
    };

    var getPlacementVariation = function(targetEl) {

        var $targetEl = $(targetEl);
        var placement = getPlacement($targetEl);
        var shift = getPopoverShiftDirection($targetEl);

        placement = placement || defaultTooltipPlacement;
        var placementVariation = "--" + placement;

        if (shift) {
            placementVariation = placementVariation + "-" + shift;
        }

        return placementVariation;
    };

    var generateTooltipId = function() {
        return "tt" + Math.floor(Math.random() * 10000000000);
    };

    var setAriaDescribedBy = function(targetEl, id) {
        $(targetEl).attr("aria-describedby", id);
    };

    var getPositionInfo = function($popover) {

        var placement = getPlacement($popover);

        if (!placement) {

            var defaultClass = isTooltip ? "comet-tooltip--" + defaultTooltipPlacement : "comet-popover--" + defaultPopoverPlacement;
            $(getPlacedEl($popover)).addClass(defaultClass);
            placement = isTooltip ? defaultTooltipPlacement : defaultPopoverPlacement;
        }

        var tooltipOffset = nubHeight + nubSpacing; //shift to account for nub and spacing

        if (isVertical(placement)) {
            var horizontalPosition = "center",
                topOfMenu = flipDirection(placement) + buildOffsetString(placement, tooltipOffset),
                bottomOfTarget = placement;
            // the tooltip is above or below the target element
            myHorizontal = horizontalPosition;
            atHorizontal = horizontalPosition;
            myVertical = topOfMenu;
            atVertical = bottomOfTarget;
        } else {
            // tooltip is to the left or right of target element
            myVertical = "center";
            atVertical = "center";
            myHorizontal = flipDirection(placement) + buildOffsetString(placement, tooltipOffset);
            atHorizontal = placement;
        }

        var tooltipShiftDirection = getPopoverShiftDirection($popover);
        if (tooltipShiftDirection) {
            // Allow the popover to align with the left or right edge of the target, used by dropdown menus
            if (tooltipShiftDirection.indexOf("-aligned") !== -1) {
                horizontalPosition = tooltipShiftDirection.replace("-aligned", "");
                topOfMenu = flipDirection(placement);
                myHorizontal = horizontalPosition;
                atHorizontal = horizontalPosition;
                myVertical = topOfMenu;
            } else {
                var myAlignment = flipDirection(tooltipShiftDirection);

                var nubPlacementShift = nubEdgeOffset + nubBaseLength / 2;
                myAlignment = myAlignment + buildOffsetString(myAlignment, nubPlacementShift);

                if (isVertical(tooltipShiftDirection)) {
                    myVertical = myAlignment;
                } else {
                    myHorizontal = myAlignment;
                }
            }
        }

        // position using jQuery UI's position() function
        return {
            "my": myHorizontal + " " + myVertical,
            "at": atHorizontal + " " + atVertical,
            "of": $el,
            "collision": "cometCustomCollisionHandler",
            "using": setFinalPosition
        };
    };

    var getPlacement = function($popover) {
        var placement;

        directions.forEach(function(direction) {
            var pattern = new RegExp("comet-.*--" + direction);
            if (pattern.test(getPlacedEl($popover).className)) {
                placement = direction;
            }
        });

        return placement || null; // if no placement is specified, default to top
    };

    var getPlacedEl = function($popover) {
        // return the element that contains the positioning class
        return $popover.get(0);
    };

    var isVertical = function(direction) {
        return direction === "top" || direction === "bottom";
    };

    var isHorizontal = function(direction) {
        return direction === "left" || direction === "right";
    };

    var flipDirection = function(direction) {
        var directionOpposites = {
            "top": "bottom",
            "bottom": "top",
            "left": "right",
            "right": "left"
        };

        return directionOpposites[direction];
    };

    var buildOffsetString = function(direction, tooltipOffset) {
        //create string to set distance between tooltip and target element to  i.e. "top-20"
        var operator;

        if (direction === "top" || direction === "left") {
            operator = "-";
        } else {
            operator = "+";
        }

        return operator + tooltipOffset;
    };

    var getPopoverShiftDirection = function($popover) {
        var shiftDirection;

        directions.forEach(function(direction) {
            var pattern = new RegExp("comet-(tooltip|tooltip__content|popover)--.+-" + direction);
            if (pattern.test(getPlacedEl($popover).className)) {
                shiftDirection = direction;
            }
        });

        if (shiftDirection === 'left' || shiftDirection === 'right') {
            if ($popover.attr("class").indexOf('-aligned') !== -1) {
                shiftDirection = shiftDirection + '-aligned';
            }
        }

        return shiftDirection || null;
    };

    var positionPopover = function($popover, positionInfo) {
        // HACK: must call position twice for <span> and <a> elements
        $popover.position(positionInfo).position(positionInfo);
    };

    $.ui.position.cometCustomCollisionHandler = {
        // handling possible collision with custom code in order to detect
        // if a popover is flipped and what direction it is flipped
        // this is based off of jQueryUI's source code
        "left": function(position, data) {
            handleCollision("left", position, data);

        },
        "top": function(position, data) {
            handleCollision("top", position, data);
        }
    };

    var handleCollision = function(direction, position, data) {
        var initialPosition = position[direction];
        flipPopover(direction, position, data);
        toggleFlippedClass(initialPosition, position, data.elem, direction);
    };

    var flipPopover = function(direction, position, data) {
        $.ui.position.flip[direction](position, data);
    };

    var toggleFlippedClass = function(initialPosition, newPosition, $element, direction) {
        var flippedClass = getFlippedClassName(direction);
        var $nub = $element.find(".comet-popover__nub , .comet-tooltip__nub");
        $nub.toggleClass(flippedClass, initialPosition !== newPosition[direction]);
    };

    var getFlippedClassName = function(direction) {
        return direction === "left" ? "flipped-x" : "flipped-y";
    };

    var setFinalPosition = function(position, info) {
        var $popover = info.element.element;
        var targetEl = info.target.element.get(0);
        var placement = getPlacement($popover);
        var isVerticallyPlaced = isVertical(placement);
        var shiftDirection = getPopoverShiftDirection($popover);
        var isHorizontallyShifted = isHorizontal(shiftDirection);
        var reposition = false;

        if (isVerticallyPlaced && !isHorizontallyShifted) {
            var viewportShiftDirection = getViewportShiftDirection($popover, targetEl, isHorizontallyShifted);

            if (viewportShiftDirection) {
                addShiftedClass($popover, viewportShiftDirection);
                reposition = true;
                // reposition the popover with its new shifted class
                setTimeout(function() {
                    showPopover($popover);
                }, 0);
            }
        }

        // have to set final position manually because of position's using() callback
        if (!reposition) {
            $(this).css(position);
        }
    };

    var getViewportShiftDirection = function($popover, targetEl, isHorizontallyShifted) {
        var shiftDirection = null;

        if ($popover.offset().left < 0) {  // the tooltip overflows the left edge of viewport
            shiftDirection = "right";
        } else {
            var viewportWidth = $("html").outerWidth();
            var popoverRightEdgePosition = Math.round($popover.offset().left + $popover.outerWidth()); // fix for dropdown breaking on 'rtl' oriented pages

            if (popoverRightEdgePosition > viewportWidth) {
                shiftDirection = "left";
            }
        }

        return shiftDirection;
    };

    var addShiftedClass = function($popover, shiftDirection) {
            var positionClass = getPlacedEl($popover).className.match(/comet-(popover|tooltip|tooltip__content)--(top|bottom)/)[0];
            var shiftedClass = positionClass + "-" + shiftDirection;
            $(getPlacedEl($popover)).removeClass(positionClass)
                .addClass(shiftedClass);
    };

    // initialize tooltips by default when DOM content has loaded
    $(document).ready(initialize);

    return {
        "initialize": initialize
    };
}();


var Comet = Comet || {};

Comet.ProductBar = function() {
    'use strict';
    var legacyProductBarClass = 'comet-product-bar--legacy';

    function setEventListeners($productBar) {
        $productBar.find(".js-comet-product-bar__show-global-nav-bar").on("click", function(e){
            // If it's a legacy product bar, just function as a link, don't trigger any global nav, it doesn't exist in this case
            if (!$productBar.hasClass(legacyProductBarClass)) {
                e.preventDefault();
                $(document).trigger("comet-show-global-nav-bar");
            }
        });

        $productBar.find(".js-comet-product-bar__toggle-panel").on("click", function(e){
            e.preventDefault();
            $(document).trigger("comet-product-bar-toggle-panel");
        });

        $productBar.find(".js-comet-product-bar__toggle-search").on("click", function(e){
            e.preventDefault();
            $(document).trigger("comet-product-bar-toggle-search");
        });
    }

    var initialize = function initialize() {
        $(".js-comet-product-bar").each(function(){
            setEventListeners($(this));
        });
    };

    var publicVars = {
        'initialize': initialize
    };

    return publicVars;
}();


$(document).ready(function(){
    'use strict';
    Comet.ProductBar.initialize();
});

var Comet = Comet || {};

Comet.Tab = function() {
    'use strict';
    var tabsWrapperSelector = ".comet-tabs",
        tabInputSelector = ".comet-tab__input",
        horizontalSlidingTabsSelector = ".comet-tabs--horizontal-sliding",
        stackingTabsSelector = ".comet-tabs--stacking",
        moreMenuTabsSelector = ".comet-tabs--more, .comet-tabs:not(" + horizontalSlidingTabsSelector + ", " + stackingTabsSelector + ")",
        moreMenuTabLabelSelector = ".comet-tab__label--more",
        horizontalSlidingWrapSelector = ".comet-tabs__horizontal-sliding-wrap",
        moreMenuSelector = ".comet-tabs__more-menu",
        moreMenuLinkSelector = ".comet-tabs__more-menu .comet-list-group__row-anchor",
        horizontalSlidingTabsLeftButtonSelector = ".comet-tabs__horizontal-sliding-indicator--left",
        horizontalSlidingTabsRightButtonSelector = ".comet-tabs__horizontal-sliding-indicator--right",
        tabLabelClass = "comet-tab__label",
        tabLabelSelectedClass = "comet-tab__label--selected",
        hiddenTabLabelClass = "comet-tab__label--hidden",
        moreMenuAllTabsHiddenClass = "comet-tabs--all-tabs-hidden",
        moreMenuVisibleClass = "comet-tabs--more-visible",
        moreMenuItemVisibleClass = "comet-tabs__more-menu-item--visible",
        moreMenuLabelSelectedClass = "comet-tab__label--selected",
        moreMenuItemSelectedClass = "comet-list-group__row--selected",
        horizontalSlidingTabsVisibleClass = "comet-tabs--horizontal-sliding-wrap-visible",
        horizontalSlidingTabsLeftAffordanceClass = "comet-tabs--left-sliding-affordance-visible",
        horizontalSlidingTabsRightAffordanceClass = "comet-tabs--right-sliding-affordance-visible",
        stackingTabsStackedClass = "comet-tabs--stacked";

    function getMoreMenuLabelWidth($tabs, $moreMenuLabel) {
        // Save more menu label width to DOM if it's not already
        if (typeof $tabs.attr("data-comet-more-menu-label-width") === 'undefined') {
            var moreMenuLabelWidth = $moreMenuLabel.outerWidth() + parseInt($moreMenuLabel.css("margin-left"), 10) + parseInt($moreMenuLabel.css("margin-right"), 10);
            $tabs.attr("data-comet-more-menu-label-width", moreMenuLabelWidth);
        } else {
            var moreMenuLabelWidth = $tabs.attr("data-comet-more-menu-label-width");
        }
        return moreMenuLabelWidth;
    }

    function enableAllTabsHiddenState($tabs) {
        if (!$tabs.hasClass(moreMenuAllTabsHiddenClass)) {
          $tabs.addClass(moreMenuAllTabsHiddenClass); // Add a class to the DOM to prevent this text from being constantly swapped
          swapMoreLabelForSelectedTab($tabs);
        }
    }

    function disableAllTabsHiddenState($tabs) {
        $tabs.removeClass(moreMenuAllTabsHiddenClass);
        resetMoreLabel($tabs);
    }

    function getLabelWidth($label) {
        return $label.outerWidth() + parseInt($label.css("margin-left"), 10) + parseInt($label.css("margin-right"), 10);
    }

    function addLabelToMoreMenu($label, $moreMenu) {
        var tabID = $label.attr("for");
        $label.addClass(hiddenTabLabelClass);
        $moreMenu.find("[href='#" + tabID + "']").closest(".comet-list-group__row").addClass(moreMenuItemVisibleClass);
    }

    function removeLabelFromMoreMenu($label, $moreMenu) {
        var tabID = $label.attr("for");
        $label.removeClass(hiddenTabLabelClass);
        $moreMenu.find("[href='#" + tabID + "']").closest(".comet-list-group__row").removeClass(moreMenuItemVisibleClass);
    }

    function setMoreMenuTabState($tabs) {
        var $moreMenuLabel = $tabs.find("> " + moreMenuTabLabelSelector),
            $tabLabels = $tabs.find("> ." + tabLabelClass + ":not(" + moreMenuTabLabelSelector + ")"),
            tabComponentWidth = $tabs.outerWidth(),
            marginOfError = 24,
            widthCount = 0,
            $moreMenu = $tabs.find(moreMenuSelector),
            moreMenuLabelVisible = false,
            contentTabsCount = $tabLabels.length,
            contentTabsHidden = 0,
            moreMenuLabelWidth = getMoreMenuLabelWidth($tabs, $moreMenuLabel);

        var availableWidth = tabComponentWidth - moreMenuLabelWidth - marginOfError;

        $tabLabels.each(function(index){
            var labelWidth = getLabelWidth($(this));

            widthCount += labelWidth;

            if (widthCount > availableWidth) {
                addLabelToMoreMenu($(this), $moreMenu);
                moreMenuLabelVisible = true;
                // Keep track of how many tabs have been "moved" into the menu
                contentTabsHidden++;
            } else {
                removeLabelFromMoreMenu($(this), $moreMenu);
            }
        });

        if (moreMenuLabelVisible) {
            $tabs.addClass(moreMenuVisibleClass);
        } else {
            $tabs.removeClass(moreMenuVisibleClass);
        }

        // When all tabs are hidden, default to just the "more" menu and replace the "more" text with the selected item's label. Works more like a dropdown
        if (contentTabsHidden === contentTabsCount) {
            enableAllTabsHiddenState($tabs);
        } else {
            disableAllTabsHiddenState($tabs);
        }

        setMoreMenuSelectedItem($tabs);
        setMoreMenuDropdownActiveState($tabs);
    }

    function setMoreMenuPosition($tabs) {
        var $moreMenu = $tabs.find(moreMenuSelector),
            $moreMenuLabel = $tabs.find(moreMenuTabLabelSelector),
            menuWidth = $moreMenu.outerWidth(),
            menuLabelLeftPosition = $moreMenuLabel.position().left;

        if (menuWidth > menuLabelLeftPosition) {
            $moreMenu.addClass("comet-tabs__more-menu--left-aligned");
        } else {
            $moreMenu.removeClass("comet-tabs__more-menu--left-aligned");
        }
    }

    function setMoreMenuSelectedItem($tabs) {
        var activeTabID = $tabs.find("." + tabLabelSelectedClass).attr("for"),
            $moreMenu = $tabs.find(moreMenuSelector);
        // Set "active/selected" state for more menu item
        $moreMenu.find("." + moreMenuItemSelectedClass).removeClass(moreMenuItemSelectedClass);
        $moreMenu.find("[href='#" + activeTabID + "']").closest(".comet-list-group__row").addClass(moreMenuItemSelectedClass);
    }

    function resetMoreLabel($tabs) {
        var $moreMenuLabel = $tabs.find(moreMenuTabLabelSelector),
            $moreMenuLabelTextWrap = $moreMenuLabel.find(".comet-tab__label-text--more"),
            moreMenuLabelDefaultText = $tabs.attr("data-comet-more-menu-default-label");
            $moreMenuLabelTextWrap.text(moreMenuLabelDefaultText);
    }

    function swapMoreLabelForSelectedTab($tabs) {
        var $moreMenuLabel = $tabs.find(moreMenuTabLabelSelector),
            $moreMenuLabelTextWrap = $moreMenuLabel.find(".comet-tab__label-text--more"),
            moreMenuLabelDefaultText = $moreMenuLabelTextWrap.text(),
            activeTabText = $tabs.find("." + tabLabelSelectedClass + ":not(" + moreMenuTabLabelSelector + ")").text();
        // Save more menu label text to DOM
        if (typeof $tabs.attr("data-comet-more-menu-default-label") === 'undefined') {
          $tabs.attr("data-comet-more-menu-default-label", moreMenuLabelDefaultText);
        } else {
          moreMenuLabelDefaultText = $tabs.attr("data-comet-more-menu-default-label");
        }

        $moreMenuLabelTextWrap.text(activeTabText);
    }

    function setMoreMenuDropdownActiveState($tabs) {
        var $moreMenuLabel = $tabs.find(moreMenuTabLabelSelector),
            $moreMenu = $tabs.find(moreMenuSelector);

        if ($moreMenu.find(".comet-tabs__more-menu-item--visible.comet-list-group__row--selected").length > 0) {
            $moreMenuLabel.addClass(moreMenuLabelSelectedClass);
        } else {
            $moreMenuLabel.removeClass(moreMenuLabelSelectedClass);
        }
    }

    function setMoreMenuEventListeners($tabs) {
        var $tabInputs = getTabInputs($tabs);

        $tabs.on("click", moreMenuLinkSelector, function(e){
            e.preventDefault();

            // Trigger a click on the corresponding tab label
            var tabID = $(this).attr("href").substr(1);
            $tabs.find("[for='" + tabID + "']").trigger("click");
        });

        $tabInputs.on("change", function(e){
            e.stopPropagation();
            setMoreMenuSelectedItem($tabs);

            // If only the "more" dropdown is being shown, swap the "more" label for the selected tab label
            if ($tabs.hasClass(moreMenuAllTabsHiddenClass)) {
                swapMoreLabelForSelectedTab($tabs);
            }

            // Add a highlight under the "More" Tab
            setMoreMenuDropdownActiveState($tabs);
        });
    }

    function setHorizontalSlidingEventListeners($tabs) {
        $(horizontalSlidingTabsLeftButtonSelector).on("click", function(e){
            e.preventDefault();
            scrollHorizontalTabs('left', $(this).closest(horizontalSlidingTabsSelector));
        });

        $(horizontalSlidingTabsRightButtonSelector).on("click", function(e){
            e.preventDefault();
            scrollHorizontalTabs('right', $(this).closest(horizontalSlidingTabsSelector));
        });

        $tabs.find(horizontalSlidingWrapSelector).on('scroll', function(){
            setHorizontalSlidingAffordances($(this));
        });
    }

    function tabLabelsWiderThanComponent($tabs) {
        var labelsWidth = 0,
            $labels = $tabs.find("." + tabLabelClass),
            componentWidth = $tabs.outerWidth(),
            marginOfError = 20,
            storedLabelsWidth = $tabs.attr("data-comet-tab-labels-width");

        if (typeof storedLabelsWidth === 'undefined') {
            $labels.each(function(){
                labelsWidth += $(this).outerWidth() + parseInt($(this).css("margin-left"), 10) + parseInt($(this).css("margin-right"), 10);
            });
            labelsWidth += marginOfError;
            $tabs.attr("data-comet-tab-labels-width", labelsWidth);
        } else {
            labelsWidth = storedLabelsWidth;
        }

        if (labelsWidth > componentWidth) {
            return true;
        } else {
            return false;
        }
    }

    function setHorizontalSlidingState($tabs) {
        if (tabLabelsWiderThanComponent($tabs)) {
            // Yes horizontal scrolling
            $tabs.addClass(horizontalSlidingTabsVisibleClass);
        } else {
            // No horizontal scrolling
            $tabs.removeClass(horizontalSlidingTabsVisibleClass);
        }
    }

    function prependTabLabelsToPanels($tabs) {
        $tabs.find("." + tabLabelClass).each(function(){
            var tabInputID = $(this).attr("for"),
                label = $(this).text();
            $("#" + tabInputID).next(".comet-tab__panel").prepend("<h3 class='comet-tab__panel-header'>" + label + "</h3>");
        });
    }

    function getTabInputs($tabs) {
        var tabPanelsSelector = "";
        $tabs.find("." + tabLabelClass).each(function(){
            var tabInputID = $(this).attr("for");
            tabPanelsSelector += "#" + tabInputID + ", ";
        });
        tabPanelsSelector = tabPanelsSelector.slice(0, -2);
        return $(tabPanelsSelector);
    }

    function setStackingState($tabs) {
        var $tabPanels = getTabInputs($tabs);
        if (tabLabelsWiderThanComponent($tabs)) {
            $tabs.addClass(stackingTabsStackedClass);
            $tabPanels.addClass(stackingTabsStackedClass);
        } else {
            $tabs.removeClass(stackingTabsStackedClass);
            $tabPanels.removeClass(stackingTabsStackedClass);
        }
    }

    function scrollActiveTabIntoView($tabs) {
        var $horizontalTabs = $tabs.find(horizontalSlidingWrapSelector),
            $activeTab = $horizontalTabs.find("." + tabLabelSelectedClass),
            maxScroll = $horizontalTabs[0].scrollWidth - $tabs.outerWidth(),
            scrollButtonOffset = 40,
            scrollPosition;

        if ($activeTab.length > 0) {
            var activeTabLeft = $activeTab.position().left;

            if (activeTabLeft < 0) {
                scrollPosition = 0;
            } else if (activeTabLeft > maxScroll) {
                scrollPosition = maxScroll - (scrollButtonOffset - (activeTabLeft - maxScroll));
            } else {
                scrollPosition = activeTabLeft - scrollButtonOffset;
            }

            $horizontalTabs.scrollLeft(scrollPosition);
            setHorizontalSlidingAffordances($horizontalTabs);
        }
    }

    function setHorizontalSlidingAffordances($horizontalTabs) {
        var leftScrollPosition = $horizontalTabs.scrollLeft(),
            $tabs = $horizontalTabs.closest(horizontalSlidingTabsSelector),
            maxScrollLeft = $horizontalTabs[0].scrollWidth - $horizontalTabs[0].clientWidth;

        if (leftScrollPosition > 0) {
            // Show the left scroll button
            $tabs.addClass(horizontalSlidingTabsLeftAffordanceClass);
        } else {
            $tabs.removeClass(horizontalSlidingTabsLeftAffordanceClass);
        }

        if (leftScrollPosition < maxScrollLeft) {
            // Show the right scroll button
            $tabs.addClass(horizontalSlidingTabsRightAffordanceClass);
        } else {
            $tabs.removeClass(horizontalSlidingTabsRightAffordanceClass);
        }
    }

    function scrollHorizontalTabs(direction, $tabs) {
        var $horizontalTabs = $tabs.find(horizontalSlidingWrapSelector),
            currentScrollPosition = $horizontalTabs.scrollLeft(),
            maxScrollLeft = $horizontalTabs[0].scrollWidth - $horizontalTabs[0].clientWidth,
            distance = $horizontalTabs[0].clientWidth - 80,
            newScrollPosition;

        if (direction === 'left') {
            distance = -distance;
            newScrollPosition = currentScrollPosition + distance;
            if (newScrollPosition <= 0) {
              newScrollPosition = 0;
            }
        } else {
            newScrollPosition = currentScrollPosition + distance;
            if (newScrollPosition >= maxScrollLeft) {
              newScrollPosition = maxScrollLeft;
            }
        }
        $horizontalTabs.stop().animate({ "scrollLeft": newScrollPosition}, 400);
        // $horizontalTabs.scrollLeft(newScrollPosition);
        setHorizontalSlidingAffordances($horizontalTabs);
    }

    function setActiveLabel($tabInput) {
        if ($tabInput.is(":checked")) {
            var id = $tabInput.attr("id"),
                $label = $("label[for='" + id + "']");

            $label.closest(tabsWrapperSelector).find("." + tabLabelSelectedClass).removeClass(tabLabelSelectedClass);
            $label.addClass(tabLabelSelectedClass);
        }
    };

    var refreshTabStates = function refreshTabStates() {
        $(moreMenuTabsSelector).each(function(){
            setMoreMenuTabState($(this));
            setMoreMenuPosition($(this));
        });

        $(horizontalSlidingTabsSelector).each(function(){
            setHorizontalSlidingState($(this));
            scrollActiveTabIntoView($(this));
        });

        $(stackingTabsSelector).each(function(){
            setStackingState($(this));
        });
    };

    // Update more menu tabs on window resize
    $(window).on('resize', refreshTabStates);

    var init = function init() {
        $(tabInputSelector).on("change", function(){
            setActiveLabel($(this));
            refreshTabStates();
        });

        $(tabInputSelector + ":checked").each(function(){
            setActiveLabel($(this));
        });

        $(moreMenuTabsSelector).each(function(){
            setMoreMenuTabState($(this));
            setMoreMenuEventListeners($(this));
            setMoreMenuPosition($(this));
        });

        $(horizontalSlidingTabsSelector).each(function(){
            $(this).addClass(horizontalSlidingTabsVisibleClass);
            setHorizontalSlidingState($(this));
            scrollActiveTabIntoView($(this));
            setHorizontalSlidingEventListeners($(this));
        });

        $(stackingTabsSelector).each(function(){
            prependTabLabelsToPanels($(this));
            setStackingState($(this));
        });
    };

    var publicVars = {
        'init': init,
        'refreshTabStates': refreshTabStates
    };

    return publicVars;
}();


$(document).ready(function(){
    'use strict';
    Comet.Tab.init();
});

Comet.Tooltips = function() {

    "use strict";

    var initialize = function() {
        Comet.Popovers.initialize({}, true);
    };

    // initialize tooltips by default when DOM content has loaded
    $(document).ready(initialize);

    return {
        "initialize": initialize
    };
}();


var Comet = Comet || {};

Comet.TopHat = function() {
    'use strict';

    var set_event_listeners = function() {
        $(".js-comet-top-hat__close-button").on("click", function(e){
            e.preventDefault();
            hide_top_hat(e);
        });
    };

    var hide_top_hat = function(e) {
        var $topHat = $(e.target).closest(".comet-top-hat"),
            $topHatHeight = $topHat.outerHeight();

        $topHat.addClass("comet-top-hat--hidden");
        $topHat.attr("aria-hidden", true);
        $topHat.css("margin-top", "-" + $topHatHeight);
    };

    var initialize = function initialize() {
        set_event_listeners();
    };

    var public_vars = {
        'initialize': initialize
    };

    return public_vars;
}();

$(document).ready(function() {
    "use strict";

    Comet.TopHat.initialize();
});

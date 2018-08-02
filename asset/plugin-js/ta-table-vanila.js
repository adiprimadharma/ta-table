(function($, window, undefined) {
    window.posState = 0;    
    var TopTriggerFixed, BottomTriggerFixed,
        sett, WindowTop, WindowBottom,
        TopEl, BottomEl, ContentEl, firstContentEl, lastContentEl, ElementParent, ScrollBar,
        fixTop, fixBottom, 
        ShadowDivTop, ShadowDivBottom, 
        elementAttach, spy,  
        screen              = $(window),
        apisScrollPane      = [],
        ScrollBarHeight     = 0, 
        GapLeft             = 0,
        heightTopGap        = 0, 
        heightBottomGap     = 0,
        countChange         = 0,
        ScrollChecker       = false,
        statusInit          = false,
        statusReinit        = false,
        ScrollSpyFixed  = function(){
            var checkChangePosTop = ElementParent.offset().top;

            WindowTop    = Math.round(screen.scrollTop()) + findFixedTop();
            WindowBottom = Math.round(screen.scrollTop() + screen.height());

            if(TopTriggerFixed !== checkChangePosTop){
                TriggerUpdate(true);                
            }            
            
            if(WindowTop >= TopTriggerFixed){

                if(WindowTop + heightTopGap >= BottomTriggerFixed - heightBottomGap){
                    setStackedEl('header',false);
                    SlideBar('delete');
                    
                }else{
                    setStackedEl('header',true);
                    SlideBar('append');
                }
                                      
                if(sett.fixFoot === true){
                    
                    if(WindowBottom >= BottomTriggerFixed){
                        setStackedEl('footer',false);
                        SlideBar('update','lastEl');
                    }else{
                        setStackedEl('footer',true);
                        SlideBar('update','bottom');
                    }

                }else{
                    if(WindowBottom >= BottomTriggerFixed || WindowBottom <= TopTriggerFixed){
                        setStackedEl('scroll',false);
                        SlideBar('update','top');
                    }else{
                        setStackedEl('scroll',true);
                        SlideBar('update','bottom');
                    }
                    
                }

            }else{
                setStackedEl('header',false);
                
                if(sett.fixFoot){
                    if((WindowBottom - heightBottomGap <= TopTriggerFixed + heightTopGap) || WindowBottom >= BottomTriggerFixed){
                        setStackedEl('footer',false);    
                        if(WindowBottom - heightBottomGap <= TopTriggerFixed + heightTopGap){
                            SlideBar('delete');                            
                        }else if(WindowBottom >= BottomTriggerFixed){
                            SlideBar('update','lastEl');
                        }
                    }else if(VisibleEl(true,firstContentEl) && WindowBottom > TopTriggerFixed){
                        setStackedEl('footer',true);
                        SlideBar('append');
                        if(WindowBottom < BottomTriggerFixed){
                            SlideBar('update','bottom');                            
                        }
                    }             
                }else{
                    if(WindowBottom - heightBottomGap <= TopTriggerFixed + heightTopGap || WindowBottom >= BottomTriggerFixed){
                        setStackedEl('scroll',false);
                        if(WindowBottom - heightBottomGap <= TopTriggerFixed + heightTopGap){
                            SlideBar('delete');                            
                        }else if(WindowBottom >= BottomTriggerFixed){
                            SlideBar('update','lastEl');
                        }
                    }else if(WindowBottom - heightBottomGap >= TopTriggerFixed){
                        setStackedEl('scroll',true);
                        SlideBar('append');
                        if(WindowBottom < BottomTriggerFixed){
                            SlideBar('update','bottom');                            
                        }
                    }
                }

            }            
        },
        ScrollWindow = function(pos,timer){
            $('html,body').animate({
                scrollTop: pos
            },timer);
        },
        SetWidthFixed = function(){
            
            TriggerUpdate(true);

            TopEl.each(function(){
                $(this).css('width', ElementParent.width() + 'px');
            });
            BottomEl.each(function(){
                $(this).css('width', ElementParent.width() + 'px');
            });
            
            FlexibleWidthTable(ElementParent);
            
            var ResizedTimer;
            if (!ResizedTimer) {
                ResizedTimer = setTimeout(function(){

                    ScrollBar    = ElementParent.find('.scroll-row.last.jspScrollable .jspHorizontalBar');
                    if(ScrollBar.length > 0){
                        ElementParent.find('.movedScroll').remove();
                        if(WindowBottom > BottomTriggerFixed){
                            ElementParent.append(ScrollBar.addClass('movedScroll').css({
                                position    : 'static',
                                paddingLeft : GapLeft + 'px'
                            }));
                        }else{
                            var heightBaseBottom    = findFixedBottom();
                            ElementParent.append(ScrollBar.addClass('movedScroll').css({
                                position    : 'fixed',
                                paddingLeft : GapLeft + 'px',
                                left        : 'auto',
                                width       : 'auto',
                                backgroundColor : 'white',
                                bottom      : heightBaseBottom + 'px',
                            }));                            
                        }
                    }
            
                    ResizedTimer = null;
                },7);
            }                    
        },
        TriggerUpdate = function(resetCount){
            
            if(resetCount){
                countChange = 0;
            }

            if(countChange === 0){
                TopTriggerFixed     = Math.round(ElementParent.offset().top),
                BottomTriggerFixed  = Math.round(TopTriggerFixed + ElementParent.outerHeight());
                countChange++;
            }
        },
        findFixedTop = function(){
            var heightFixBefore = 0;
            /* still optional, need improvement */
            $('header').each(function(){
                if($(this).css('position') == 'fixed'){
                    heightFixBefore += $(this).height();
                }
            });
            return heightFixBefore;
        },
        findFixedBottom = function(){
            var heightFixBefore = 0;
             /* still optional, need improvement */
            $('footer').each(function(){
                if($(this).css('position') == 'fixed'){
                    heightFixBefore += $(this).height();
                }
            });
            return heightFixBefore;
        },
        setScrollBar = function(){
            /* move scrollbar */
            ElementParent.append(ScrollBar.addClass('movedScroll').css({
                position    : 'static',
                paddingLeft : GapLeft + 'px'
            }));
        },
        setStackedEl = function(el,status){
            if(TopEl !== undefined || BottomEl !== undefined){
                /* for normal condition */
                if(el === "header"){
                    /* checker shadow */
                    ShadowDivTop        = ElementParent.find('.shadowDivTop');

                    if(status){
                        var heightBaseTop   = findFixedTop(),
                            idx             = TopEl.length - 1;

                        /* append shadow div */
                        if(ShadowDivTop.length === 0){
                            var Template    = '' + '<div class="shadowDivTop" style="height:'+heightTopGap+'px"></div>';

                            TopEl.eq(idx).after(Template);
                        }
                        
                        TopEl.each(function(index){
                            if(index === idx){
                                $(this).addClass('fixed-scroll').addClass('shadow-bottom').css({width: ElementParent.width() + 'px', top: heightBaseTop + 'px', position: ''});
                            }else{
                                $(this).addClass('fixed-scroll').css({width: ElementParent.width() + 'px', top: heightBaseTop + 'px', position: ''});                                    
                            }
                            heightBaseTop += $(this).height();
                        });
                        
                    }else{
                        TopEl.each(function(){
                            $(this).removeClass('fixed-scroll').removeClass('shadow-bottom').css('top','');
                        });

                        if(ShadowDivTop.length > 0){
                            ShadowDivTop.remove();
                        }
                    }
                }else if(el === 'footer'){
                    /* checker shadow */ 
                    ShadowDivBottom        = ElementParent.find('.shadowDivBottom');

                    if(status){
                        var heightBaseBottom    = findFixedBottom(),
                            ScrollBar           = ElementParent.find('.movedScroll');

                        ScrollBar.each(function(){
                            $(this).css({
                                position    : 'fixed',
                                left        : 'auto',
                                width       : 'auto',
                                backgroundColor : 'white',
                                bottom      : heightBaseBottom + 'px',
                            });
                            heightBaseBottom += $(this).height();
                        });

                        for(var i = BottomEl.length - 1; i >= 0; i--){
                            $(BottomEl[i]).addClass('fixed-scroll').css({width: ElementParent.width() + 'px', bottom: heightBaseBottom + 'px'});
                            heightBaseBottom += $(BottomEl[i]).height();
                        }

                        /* add shadow */
                        BottomEl.eq(0).addClass('shadow-top');

                        if(ShadowDivBottom.length === 0){
                            var Template = '' + '<div class="shadowDivBottom" style="height:'+heightBottomGap+'px"></div>',
                                idx         = BottomEl.length - 1;

                            BottomEl.eq(idx).after(Template);
                        }

                    }else{
                        var ScrollBar           = ElementParent.find('.movedScroll');
                            
                        BottomEl.each(function(){
                            $(this).removeClass('fixed-scroll').removeClass('shadow-top').css('bottom','');
                        });
                        ScrollBar.each(function(){
                            $(this).css({
                                position        : 'static',
                                left            : 'auto',
                                backgroundColor : 'transparent',
                                bottom          : ''
                            });
                        });

                        /* remove shadow behind fixed */
                        if(ShadowDivBottom.length > 0){
                            ShadowDivBottom.remove();
                        }
                    }
                }else if(el === 'scroll'){
                    /* checker shadow */
                    ShadowDivBottom        = ElementParent.find('.shadowDivBottom');
                    
                    if(status){
                        var heightBaseBottom    = findFixedBottom(),
                            ScrollBar           = ElementParent.find('.movedScroll');

                        ScrollBar.each(function(){
                            $(this).css({
                                position    : 'fixed',
                                left        : 'auto',
                                width       : 'auto',
                                backgroundColor : 'white',
                                bottom      : heightBaseBottom + 'px',
                            });
                            heightBaseBottom += $(this).height();
                        });

                        /* shadow div */
                        if(ShadowDivBottom.length === 0){
                            var Template = '' + '<div class="shadowDivBottom" style="height:'+ScrollBarHeight+'px"></div>';

                            ScrollBar.after(Template);
                        }

                    }else{
                        var ScrollBar           = ElementParent.find('.movedScroll');
                            
                        ScrollBar.each(function(){
                            $(this).css({
                                position        : 'static',
                                left            : 'auto',
                                backgroundColor : 'transparent',
                                bottom          : ''
                            });
                        });
                        
                        /* remove shadow behind fixed */
                        if(ShadowDivBottom.length > 0){
                            ShadowDivBottom.remove();
                        }

                    }
                }
            }
        },
        VisibleEl = function(partial,elem){
            var $t              = $(elem),
                $w              = screen,
                viewTop         = $w.scrollTop(),
                viewBottom      = viewTop + $w.height(),
                _top            = $t.offset().top,
                _bottom         = _top + $t.height(),
                compareTop      = partial === true ? _bottom : _top,
                compareBottom   = partial === true ? _top : _bottom;
            
            return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            
        },
        setEvent = function(activeConditiion){
            if(activeConditiion){
                if(window.addEventListener) {
                    window.addEventListener('scroll', ScrollSpyFixed, false);
                    window.addEventListener('resize', SetWidthFixed, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onscroll', ScrollSpyFixed);
                    window.attachEvent('onresize', SetWidthFixed);
                }
            }else{
                window.removeEventListener('scroll', ScrollSpyFixed);
                window.removeEventListener('resize', SetWidthFixed);
            }
        },
        SyncScrollBar = function(){

            if(ElementParent.find('.scroll-row.not-last').data('jsp') !== undefined && ElementParent.find('.scroll-row.last').data('jsp') !== undefined ){

                var posLeftLast = ElementParent.find('.scroll-row.not-last').data('jsp').getContentPositionX(),
                    Target, checkEnd;

                ElementParent.on('jsp-scroll-x', '.scroll-row.not-last', function(event, scrollPositionX, isAtLeft, isAtRight) {
                    ElementParent.find('.scroll-row.last').each(function(){
                        if($(this).data('jsp') !== undefined){
                            $(this).data('jsp').scrollToX(scrollPositionX);
                            posLeftLast = scrollPositionX;
                            checkEnd = isAtRight;
                            var pos = getPositionPercentX();
                            if(pos !== undefined){
                                window.posState = pos;
                            }
                        }
                    });
                });
                
                ElementParent.on('jsp-scroll-x','.scroll-row.last', function(event, scrollPositionX, isAtLeft, isAtRight){      
                    var siblingsrow = ElementParent.find('.scroll-row.not-last .jspPane');
                    siblingsrow.css('left',-scrollPositionX);

                    posLeftLast = scrollPositionX;
                    checkEnd    = isAtRight;

                    if($(this).data('jsp') !== undefined){
                        var pos = getPositionPercentX();
                        if(pos !== undefined){
                            window.posState = pos;
                        }
                    }

                    if(parseInt(-scrollPositionX) === 0){
                        ElementParent.find('.scroll-row').removeClass('shadow-scroll');   
                    }else if(parseInt(-scrollPositionX) < 0){
                        ElementParent.find('.scroll-row').addClass('shadow-scroll');   
                    }                

                    Target = ElementParent.find('.slideBarScroll');
                    if(checkEnd){
                        if(Target.css('visibility') !== 'hidden'){
                            Target.css('visibility','hidden');
                        }
                    }else{
                        if(Target.css('visibility') !== 'visible'){
                            Target.css('visibility','visible');
                        }
                    }


                    /* for change background */
                    ElementParent.find('.movedScroll .jspTrack').css({backgroundColor: "#f1f1f1"});
                    
                    /* for check if user didnt scroll */
                    clearTimeout($.data(this, 'scrollTimer'));                
                    $.data(this, 'scrollTimer', setTimeout(function() {
                        /* do something */
                        ElementParent.find('.movedScroll .jspTrack').css({backgroundColor: "inherit"});
                    }, 250));

                });
                        
                ElementParent.on('mousedown',".jspTrack , .scroll-row.last", function() {
                    ElementParent.find('.scroll-row.not-last').each(function(){
                        $(this).data('jsp').scrollToX(ElementParent.find('.scroll-row.last').data('jsp').getContentPositionX());
                    })
                });

                /* for hovering and active state scrollbar */
                ElementParent.on('mouseover','.movedScroll .jspDrag', function(e){
                    $(this).closest('.jspTrack').css({backgroundColor: '#f1f1f1'});
                })
                .on('mouseout','.movedScroll .jspDrag', function(e){
                    $(this).closest('.jspTrack').css({backgroundColor: 'inherit'});
                });

                var timeout;
                ElementParent.on('mousedown','.slideBarScroll',function(){                
                    
                    timeout = setInterval(function(){
                        
                        Target = ElementParent.find('.slideBarScroll');
                        if(Target.css('visibility') === 'hidden'){
                            clearInterval(timeout);
                            return false;
                        }
                        
                        ElementParent.find('.scroll-row.not-last').data('jsp').scrollToX(posLeftLast += 15);
                    }, 3);
                })
                .on('mouseup','.slideBarScroll',function(){
                    clearInterval(timeout);
                    
                    Target = ElementParent.find('.slideBarScroll');
                    if(checkEnd){
                        if(Target.css('visibility') !== 'hidden'){
                            Target.css('visibility','hidden');
                        }
                    }else{
                        if(Target.css('visibility') !== 'visible'){
                            Target.css('visibility','visible');
                        }
                    }
                    
                    return false;
                });

            }else{
                ElementParent.find('.scroll-row').unbind();
            }

        },
        SlideBar = function(actionOption,optionUpdate){

            var barTemplate = ''+   '<div class="slideBarScroll" style="height:'+TopEl.eq(TopEl.length - 1).height()+'px;">'+
                                    '<i class="ta-icon ta-icon-point-right"></i>'+
                                    '</div>';
            
            if(actionOption === 'append'){
                if(ElementParent.find('.slideBarScroll').length === 0 && ElementParent.find('.movedScroll').length > 0){
                    TopEl.eq(TopEl.length - 1).append(barTemplate);
                }
            }else if(actionOption === 'update'){
                /* update height */
                
                var updateHeight;
                if (!updateHeight) {
                updateHeight = setTimeout(function(){
                        
                        if(optionUpdate === 'bottom'){
                            ElementParent.find('.slideBarScroll').css({height : Math.round((WindowBottom - heightBottomGap) - TopEl.eq(TopEl.length - 1).offset().top ) + 'px'});                                
                        }else if(optionUpdate === 'top'){
                            ElementParent.find('.slideBarScroll').css({height : Math.round((BottomTriggerFixed - heightBottomGap) - (WindowTop + (heightTopGap - TopEl.eq(TopEl.length -1).height()))) + 'px'});                                
                        }else if(optionUpdate === 'lastEl'){
                            ElementParent.find('.slideBarScroll').css({height : Math.round(TopEl[TopEl.length - 1].offsetHeight + ElementParent.find('.table__wrapper').outerHeight(true) ) + 'px'});                                    
                        }

                        updateHeight = null;
                    },.001);
                }  
                
            }else if(actionOption === 'delete'){
                ElementParent.find('.slideBarScroll').remove();                
            }
        },
        FlexibleWidthTable = function(ElementTable){
            var contPar             = $(ElementTable),
                allHead             = $(ElementTable).find('.table-header-row'),
                headRow             = allHead.has('.table-content'),
                headFirst           = headRow.eq(0).find('.table-content'),
                headFirstFix        = headRow.eq(0).find('.table-content.stay'),
                stayWidth           = 0,
                allStayWidth        = 0,
                countStayWidth      = 0,
                countAllStayWidth   = 0,
                totalWidthHead      = 0,
                gapWidth            = 0,
                elementNotFix       = 0,
                WidthAdd            = 0,
                cssAppend           = $('head').find('#css-flex-'+$(ElementTable).attr('id')),
                adjustedCol;
                cssAppend.remove();
            
                headFirstFix.each(function(){
                    countStayWidth++;
                    stayWidth += $(this).outerWidth(true);
                });

                headFirst.each(function(){
                    countAllStayWidth++;
                    allStayWidth += $(this).outerWidth(true);
                });
                
                totalWidthHead += (stayWidth+(allStayWidth - stayWidth));

                if(totalWidthHead < headRow.outerWidth(true)){
                    elementNotFix   = countAllStayWidth - countStayWidth;
                    if(elementNotFix === 0){
                        /*for table that has no scroll to right coloumn*/
                        var notCountedCol = headRow.find('.fixed-width').length;
                        elementNotFix = countAllStayWidth - notCountedCol;
                        adjustedCol = headFirst;
                    }else {
                        adjustedCol = headRow.eq(0).find('.table-content:not(.stay)');
                    }

                    gapWidth        = allHead.outerWidth(true) - totalWidthHead;
                    WidthAdd        += (gapWidth/elementNotFix);

                    
                    cssAppend.remove();

                    var template =''+ '<style id="css-flex-'+$(ElementTable).attr('id')+'">';
                    adjustedCol.each(function(i,v){
                        if(!$(this).hasClass('fixed-width')){
                            var elHead          = $(this),
                                elWidth         = elHead.outerWidth(true),
                                classText       = elHead.data('colName');
                            if(headFirstFix.length == 0 && i == adjustedCol.length-1){
                               elWidth += -0.2;
                            }
                            template += '#'+ElementParent[0].id+' .table-content.'+ classText + '{'+
                                            'width:'+ (elWidth + WidthAdd) +'px;'+
                                        '}'; 
                        }
                    });
                    
                    template += '</style>';
                    $('head').append(template);

                    /* delete class shadow scroll effect */
                    if(ElementTable.find('.scroll-row').hasClass('shadow-scroll')){
                        ElementTable.find('.scroll-row').removeClass('shadow-scroll');
                    }

                }else{
                    cssAppend.remove();
                }

                if(contPar.outerWidth(true) > allStayWidth){
                    setStackedEl('scroll',false);
                    contPar.find('.movedScroll').remove();
                    SlideBar('delete');
                }
            
        },
        getPositionPercentX = function(){
            var pos = ElementParent.find('.scroll-row.last').data('jsp').getPercentScrolledX();
            if(pos !== 0 || pos !== -0){
                return pos;
            }
        },
        setPositionPercentX = function(percent){
            if(ElementParent.find('.scroll-row.last').length !== 0){
                if(ElementParent.find('.scroll-row.last').data('jsp').scrollToPercentX(percent)){
                    return true;
                }else{
                    return false;
                }
            }
        },
        setTable = function(dataset, columnArray){
            try {
                if(typeof dataset == 'object'){
                    var templateHeader = '',
                        templateContent = '',
                        tableRowContent = '';
                    for (let index = 0; index < dataset[0].length; index++) {
                        templateHeader += '<div class="table-content"></div>';
                    }
                    for (let index = 0; index < dataset.length; index++) {
                        var tableContent = '';
                        dataset[index].forEach(element => {
                            tableContent+= '<div class="table-content">'+element+'</div>';
                        });
                       tableRowContent += '<div class="table-content-row">'+tableContent+'</div>';
                    }
                    ElementParent.prepend('<div class="table__wrapper">'+tableRowContent+'</div>')
                    ElementParent.prepend('<div class="table-header-row">'+templateHeader+'</div>')
                }else{
                    console.log('please insert an object');
                }
            }
            catch(err) {
                console.log(err)
                return false;
            }
        },
        setColumnsAttribute = function(totalFixedColumns, columnArray){
            var columnHeader = TopEl.find('.table-content'),
                columnContent = ContentEl.find('.table-content');

            /* append scroll row to header */    
            columnHeader.filter(function( index ) {
                return index >= totalFixedColumns;
            }).wrapAll('<div class="scroll-row not-last">'+
                            '<div style="display:flex">');

            /* add class stay to header */    
            columnHeader.filter(function( index ) {
                return index < totalFixedColumns;
            }).addClass('stay');
            
            columnArray.sort(function(a,b){
                return a.colIndex - b.colIndex;
            });

            /* Add default data column */
            for (let index = 1; index < columnArray.length; index++) {
                if(columnArray[index].colIndex && columnArray[index].colIndex - columnArray[index-1].colIndex !== 1){
                    var x = columnArray[index].colIndex - columnArray[index-1].colIndex;
                    var j = 1;
                    while (j<x)
                    {
                        var newIndex = parseInt(columnArray[index-1].colIndex+j);
                        var DataAddon = {
                            colIndex: newIndex,
                            title: 'Title Kolom-'+newIndex,
                            className: 'classNameCol'+newIndex
                        }
                        columnArray.push(DataAddon)
                        j++;
                    }
                }
            }
            
            /* Manipulate the header table */
            for (let index = 0; index < columnHeader.length; index++) {
                if(columnArray[index] && columnArray[index].colIndex == index){
                    if(columnArray[index].title){
                        columnHeader.eq(columnArray[index].colIndex).prepend('<span>'+columnArray[index].title+'</span>');
                    }
                    if(columnArray[index].className){
                        columnHeader.eq(columnArray[index].colIndex).addClass(columnArray[index].className).attr('data-col-name',columnArray[index].className);
                    }
                    if(columnArray[index].tooltip){
                        var tooltipText = columnArray[index].dataTooltip ? columnArray[index].dataTooltip : '';
                        columnHeader.eq(columnArray[index].colIndex).append('<i class="info-tooltip ta-icon ta-icon-tooltip" data-hover="tooltip" data-original-title="'+tooltipText+'" data-container="body"></i>')
                    }
                    if(columnArray[index].sort){
                        columnHeader.eq(columnArray[index].colIndex).addClass('sort').append(
                        '<i class="ta-icon ta-icon-triangle-up hide" data-dir=""></i>'+
                        '<i class="ta-icon ta-icon-triangle-down hide" data-dir="-"></i>')
                    }
                    if(columnArray[index].fixedWidth){
                        columnHeader.eq(columnArray[index].colIndex).addClass('fixed-width')
                    }
                }else{
                    columnHeader.eq(index).prepend('<span>Title Kolom-'+(index+1)+'</span>')
                    columnHeader.eq(index).addClass('classNameCol'+(index+1)).attr('data-col-name', 'classNameCol'+(index+1))
                }
            }

            /* Manipulate the content table */
            for (let index = 0; index < ContentEl.length; index++) {
                if(index == ContentEl.length-1){
                    var classLast = 'last';
                }else {
                    var classLast = 'not-last';
                }
                ContentEl.eq(index).find('.table-content').filter(function( indexCol ) {
                    return indexCol >= totalFixedColumns;
                }).wrapAll('<div class="scroll-row '+classLast+'">'+
                                '<div style="display:flex">');
                                    /* add class stay to header */    
                ContentEl.eq(index).find('.table-content').filter(function( index ) {
                    return index < totalFixedColumns;
                }).addClass('stay');

                var rowElement = ContentEl.eq(index).find('.table-content');
                for (let indexCol = 0; indexCol < rowElement.length; indexCol++) {
                    if(columnArray[indexCol] && columnArray[indexCol].colIndex == indexCol){
                        if(columnArray[indexCol].className){
                            rowElement.eq(columnArray[indexCol].colIndex).addClass(columnArray[indexCol].className)
                        }else{
                            rowElement.eq(indexCol).addClass('classNameCol'+(indexCol+1))
                        }
                    }else{
                        rowElement.eq(indexCol).addClass('classNameCol'+(indexCol+1))
                    }    
                } 
            }
        },
        setCustomHeader = function(customHeader){
            try {
                if(typeof customHeader == 'object'){
                    for (let index = 0; index < customHeader.length; index++) {
                        ElementParent.prepend('<div class="table-header-row '+customHeader[index].className+'">'+customHeader[index].html+'</div>')
                    }
                }else{
                    console.log('please insert an object');
                }
            }
            catch(err) {
                console.log(err)
                return false;
            }
        },
        methods = {
            init: function(option){
                    return this.each(function(){
                        ElementParent       = $(this),
                        sett                = $.extend( {}, $.fn.fixedHeadFoot.defaults, option );

                        if(sett.data.length !== 0 && sett.columns.length !== 0){
                            /* set table template */
                            setTable(sett.data, sett.columns);
                        }
                        if(sett.customHeader.length !== 0){
                            setCustomHeader(sett.customHeader);
                        }

                        TopEl               = ElementParent.find('.table-header-row'),
                        BottomEl            = ElementParent.find('.table-footer-row'),
                        ContentEl           = ElementParent.find('.table-content-row'),                        
                        firstContentEl      = ElementParent.find('.table-content-row').eq(0),
                        lastContentEl       = ContentEl.eq(ContentEl.length - 1),
                        headRow             = TopEl.has('.table-content'),
                        StayContent         = headRow.eq(0).find('.table-content'),                
                        WindowTop           = screen.scrollTop() + findFixedTop(),
                        WindowBottom        = screen.scrollTop() + screen.height(),
                        TopTriggerFixed     = Math.round(ElementParent.offset().top),
                        BottomTriggerFixed  = Math.round(TopTriggerFixed + ElementParent.outerHeight()),
                        ScrollBarHeight     = 0, 
                        GapLeft             = 0,
                        heightTopGap        = 0, 
                        heightBottomGap     = 0,
                        countChange         = 0,
                        ScrollChecker       = false, 
                        statusInit          = true;                             
                        setEvent(true);
                        if(sett.data.length !== 0 && sett.columns.length !== 0){
                            /* set Columns Attribute function */
                            setColumnsAttribute(sett.fixedColumns, sett.columns);
                         }
                       
                        /* init jscrollpane */
                        if (statusReinit){
                            if($(this).find('.scroll-row').length > 0){
                                $(this).find('.scroll-row').jScrollPane();
                                var api = $(this).find('.scroll-row').data('jsp');
                                setPositionPercentX(window.posState);
                                var throttleTimeout;
                                $(window).bind('resize',function(){
                                    if (!throttleTimeout) {
                                        throttleTimeout = setTimeout(function(){
                                            api.reinitialise();
                                            setPositionPercentX(window.posState);
                                            throttleTimeout = null;
                                        },10);   
                                    }
                                });    
                            } else {
                                FlexibleWidthTable(ElementParent);
                            };
                        }else{
                            if($(this).find('.scroll-row').length > 0){
                                $(this).find('.scroll-row').each(function(){
                                    apisScrollPane.push($(this).jScrollPane());
                                    var api = $(this).data('jsp');
                                    var throttleTimeout;
                                    $(window).bind('resize',function(){
                                        if (!throttleTimeout) {
                                            throttleTimeout = setTimeout(function(){
                                                api.reinitialise();
                                                setPositionPercentX(window.posState);
                                                throttleTimeout = null;
                                            },1);
                                        }
                                    });
                                });
                            }
                        }

                        ScrollBar           = ElementParent.find('.scroll-row.last .jspHorizontalBar');
                        TopEl.each(function(){
                            heightTopGap += $(this).height();    
                        });

                        BottomEl.each(function(){
                            heightBottomGap += $(this).height();
                        });
                        
                        ScrollBar.each(function(){
                            ScrollBarHeight += $(this).height();
                            heightBottomGap += $(this).height();
                        });
                        
                        StayContent.each(function(){
                            if($(this).parents('.scroll-row').length === 0){
                                /*GapLeft += $(this).outerWidth(true);*/
                                GapLeft += $(this)[0].offsetWidth;
                            }
                        });
                        
                        setScrollBar();
                        if(sett.fixFoot){
                            if((WindowBottom < BottomTriggerFixed) && (VisibleEl(true,firstContentEl) || WindowTop >= TopTriggerFixed)){
                                setStackedEl('footer',true);

                                if(WindowTop > TopTriggerFixed){
                                    setStackedEl('header',true);
                                }

                                TriggerUpdate(true);
                            }
                        }else{
                            if(WindowBottom > TopTriggerFixed){
                                if(WindowBottom < BottomTriggerFixed){
                                    setStackedEl('scroll',true);
                                    SlideBar('append');
                                    SlideBar('update','bottom');    
                                }else if(WindowBottom > BottomTriggerFixed){
                                    SlideBar('append');
                                    SlideBar('update','lastEl');        
                                }
                                if(WindowTop > TopTriggerFixed){
                                    setStackedEl('header',true);
                                }
                            }
                        }
                        SyncScrollBar();
                        methods.Responsive();
                    });
                    
            },    
            destroy: function(){
                setEvent(false);
                setStackedEl('header',false);
                setStackedEl('footer',false);
                setStackedEl('scroll',false);
                ElementParent.css('height','');
                SlideBar('delete');
                ElementParent.find('.movedScroll').remove();
                $('head').find('#css-flex-'+$(ElementParent).attr('id')).remove();

                GapLeft             = 0,
                heightTopGap        = 0, 
                heightBottomGap     = 0,
                TopTriggerFixed     = 0,
                BottomTriggerFixed  = 0,
                countChange         = 0,         
                ScrollChecker       = false,
                statusInit          = false,
                statusReinit        = true;

                /* destroy api jspan */
                $.each(ElementParent.find('.scroll-row'),function() {
                    var api = $(this).data('jsp');
                    if (api) {
                      api.destroy();
                    }
                });
                apisScrollPane = [];

                /*destroy resize sensor*/
                spy.uninstall(ElementParent);
            },
            HasBeenInit : function(){
                return statusInit;
            },
            Responsive: function(){
                if(statusInit){

                    elementAttach = ElementParent,
                        spy = elementResizeDetectorMaker({
                        strategy: "scroll",
                        callOnAdd: true,
                        debug: false
                    });
                    spy.listenTo(elementAttach,function(b){
                    if($('body').css('overflow') !== 'hidden'){
                        clearTimeout($.data(this, 'scrollTimer11'));                
                        $.data(this, 'scrollTimer11', setTimeout(function() {
                            var length = $(ElementParent).find('.scroll-row').length;
                            $(ElementParent).find('.scroll-row').each(function(index){
                                var api = $(this).data('jsp');
                                var throttleTimeout;
                                if (!throttleTimeout) {
                                    throttleTimeout = setTimeout(function(){
                                        if(api !== undefined){
                                            api.reinitialise();
                                          
                                            if(index === (length - 1)){
                                                setPositionPercentX(window.posState);
                                            }
                                        }
                                        throttleTimeout = null;
                                    },0);
                                }
                            });
                            SetWidthFixed();
                            heightTopGap = 0,
                            heightBottomGap = 0;
                            ScrollBarHeight = 0;

                            TopEl.each(function(){
                                heightTopGap += $(this).height();    
                            });
    
                            BottomEl.each(function(){
                                heightBottomGap += $(this).height();
                            });    

                            ScrollBar.each(function(){
                                ScrollBarHeight += $(this).height();
                                heightBottomGap += $(this).height();
                            });

                            TriggerUpdate(true); 
                            
                        }, 10));
                
                        }
                    });

                }

            }
        }

    $.fn.fixedHeadFoot = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            /* Default to "init" */
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery FixHeadFootTAToped' );
        }    
    };

    /* defaults setting */
    $.fn.fixedHeadFoot.defaults = {
        fixHead: true,
        fixFoot: false,
        fixedColumns: 0,
        fixedWidth: false,
        columns: [],
        data: [],
        customHeader: [],


       /*  for next improvement
        FixedTopEl : {},
        FixedBotEl : {} */
    }

})(jQuery, this);

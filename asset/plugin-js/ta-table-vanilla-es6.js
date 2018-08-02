const $ = require('jquery');
const elementResizeDetectorMaker = require('./element-resize-detector.min');
require('./jquery.jscrollpane.min');
require('./jquery.mousewheel');
const jscrollcss = require('../plugin-css/jquery.jscrollpane.css');
const tatablecss = require('../plugin-css/ta-table-new.css');

class TATable {
    
    constructor($container, options) {
        window.posState = 0;
        this.ElementParent       = $container;
        this.options             = $.extend(true, {}, $.fn.tatable.defaults, options);

        if(this.options.data.length !== 0 && this.options.columns.length !== 0){
            this.setTable(this.options.data, this.options.columns);
        }

        if(this.options.customHeader.length !== 0){
            this.setCustomHeader(this.options.customHeader);
        }

        this.apisScrollPane      = [];
        this.TopEl               = this.ElementParent.find('.table-header-row');
        this.BottomEl            = this.ElementParent.find('.table-footer-row');
        this.ContentEl           = this.ElementParent.find('.table-content-row');                        
        this.firstContentEl      = this.ElementParent.find('.table-content-row').eq(0);
        this.lastContentEl       = this.ContentEl.eq(this.ContentEl.length - 1);
        this.headRow             = this.TopEl.has('.table-content');
        this.StayContent         = this.headRow.eq(0).find('.table-content');  
        this.screen              = $(window);              
        this.WindowTop           = this.screen.scrollTop() + this.findFixedTop();
        this.WindowBottom        = this.screen.scrollTop() + this.screen.height();
        this.TopTriggerFixed     = Math.round(this.ElementParent.offset().top);
        this.BottomTriggerFixed  = Math.round(this.TopTriggerFixed + this.ElementParent.outerHeight());
        this.ScrollBarHeight     = 0; 
        this.GapLeft             = 0;
        this.heightTopGap        = 0; 
        this.heightBottomGap     = 0;
        this.countChange         = 0;
        this.ScrollChecker       = false; 
        this.statusInit          = true;
        this.statusReinit        = false;
        this.spy                 = elementResizeDetectorMaker({strategy: "scroll", callOnAdd: true, debug: false });
        this.elementAttach       = this.ElementParent;           
        // this.ShadowDivTop        = this.ElementParent.find('.shadowDivTop');                  
        // this.ShadowDivBottom     = this.ElementParent.find('.shadowDivBottom');
        // this.checkChangePosTop   = this.ElementParent.offset().top;
        
        this.setEvent(true);

        if(this.options.data.length !== 0 && this.options.columns.length !== 0){
            /* set Columns Attribute function */
            this.setColumnsAttribute(this.options.fixedColumns, this.options.columns);
         }
       
        /* init jscrollpane */
        if (this.statusReinit){
            const $setPositionPercentX = this.setPositionPercentX(window.posState);
            if($($container).find('.scroll-row').length > 0){
                $($container).find('.scroll-row').jScrollPane();
                var api = $($container).find('.scroll-row').data('jsp');
                $setPositionPercentX;
                var throttleTimeout;
                $(window).bind('resize',function(){
                    if (!throttleTimeout) {
                        throttleTimeout = setTimeout(function(){
                            api.reinitialise();
                            $setPositionPercentX;
                            throttleTimeout = null;
                        },10);   
                    }
                });    
            } else {
                this.FlexibleWidthTable($container);
            };
        }else{
            const $apisScrollPane = this.apisScrollPane;
            if($($container).find('.scroll-row').length > 0){
                $($container).find('.scroll-row').each(function(){
                    $apisScrollPane.push($(this).jScrollPane());
                    var api = $(this).data('jsp');
                    var throttleTimeout;
                    $(window).bind('resize',function(){
                        if (!throttleTimeout) {
                            throttleTimeout = setTimeout(function(){
                                api.reinitialise();
                                $setPositionPercentX;
                                throttleTimeout = null;
                            },1);
                        }
                    });
                });
            const $setPositionPercentX = this.setPositionPercentX(window.posState);
            }
        }

        let $heightTopGap = this.heightTopGap;
        let $heightBottomGap = this.heightBottomGap;
        let $ScrollBarHeight = this.ScrollBarHeight;
        let $GapLeft = this.GapLeft;
        this.ScrollBar = this.ElementParent.find('.scroll-row.last.jspScrollable .jspHorizontalBar');

        this.TopEl.each(function(){
            $heightTopGap += $(this).height();    
        });

        this.BottomEl.each(function(){
            $heightBottomGap += $(this).height();
        });
        
        this.ScrollBar.each(function(){
            $ScrollBarHeight += $(this).height();
            $heightBottomGap += $(this).height();
        });
        
        this.StayContent.each(function(){
            if($(this).parents('.scroll-row').length === 0){
                /*GapLeft += $($container).outerWidth(true);*/
                $GapLeft += $(this)[0].offsetWidth;
            }
        });

        this.GapLeft = $GapLeft;
        this.heightTopGap = $heightTopGap;
        this.heightBottomGap = $heightBottomGap;
        this.ScrollBarHeight = $ScrollBarHeight;
        this.setScrollBar();

        if(this.options.fixFoot){
            if((this.WindowBottom < this.BottomTriggerFixed) && (VisibleEl(true,firstContentEl) || WindowTop >= TopTriggerFixed)){
                this.setStackedEl('footer',true);

                if(this.WindowTop > this.TopTriggerFixed){
                    this.setStackedEl('header',true);
                }

                this.TriggerUpdate(true);
            }
        }else{
            if(this.WindowBottom > this.TopTriggerFixed){
                if(this.WindowBottom < this.BottomTriggerFixed){
                    this.setStackedEl('scroll',true);
                    this.SlideBar('append');
                    this.SlideBar('update','bottom');    
                }else if(this.WindowBottom > this.BottomTriggerFixed){
                    this.SlideBar('append');
                    this.SlideBar('update','lastEl');        
                }
                if(this.WindowTop > this.TopTriggerFixed){
                    this.setStackedEl('header',true);
                }
            }
        }
        this.SyncScrollBar();
        this.Responsive();
    }

    /* METHODS */
    ScrollSpyFixed(){
        const checkChangePosTop = this.ElementParent.offset().top;
        this.WindowTop    = Math.round(this.screen.scrollTop()) + this.findFixedTop();
        this.WindowBottom = Math.round(this.screen.scrollTop() + this.screen.height());

        if(this.TopTriggerFixed !== checkChangePosTop){
            this.TriggerUpdate(true);                
        }           
        
        if(this.WindowTop >= this.TopTriggerFixed){

            if(this.WindowTop + this.heightTopGap >= this.BottomTriggerFixed - this.heightBottomGap){
                this.setStackedEl('header',false);
                this.SlideBar('delete');
                
            }else{
                this.setStackedEl('header',true);
                this.SlideBar('append');
            }
                                  
            if(this.optionsfixFoot === true){
                
                if(this.WindowBottom >= this.BottomTriggerFixed){
                    this.setStackedEl('footer',false);
                    this.SlideBar('update','lastEl');
                }else{
                    this.setStackedEl('footer',true);
                    this.SlideBar('update','bottom');
                }

            }else{
                if(this.WindowBottom >= this.BottomTriggerFixed || this.WindowBottom <= TopTriggerFixed){
                    this.setStackedEl('scroll',false);
                    this.SlideBar('update','top');
                }else{
                    this.setStackedEl('scroll',true);
                    this.SlideBar('update','bottom');
                }
                
            }

        }else{
            this.setStackedEl('header',false);
            
            if(this.optionsfixFoot){
                if((this.WindowBottom - this.heightBottomGap <= this.TopTriggerFixed + this.heightTopGap) || this.WindowBottom >= this.BottomTriggerFixed){
                    this.setStackedEl('footer',false);    
                    if(this.WindowBottom - this.heightBottomGap <= this.TopTriggerFixed + this.heightTopGap){
                        this.SlideBar('delete');                            
                    }else if(this.WindowBottom >= this.BottomTriggerFixed){
                        this.SlideBar('update','lastEl');
                    }
                }else if(this.VisibleEl(true,this.firstContentEl) && this.WindowBottom > this.TopTriggerFixed){
                    this.setStackedEl('footer',true);
                    this.SlideBar('append');
                    if(this.WindowBottom < this.BottomTriggerFixed){
                        this.SlideBar('update','bottom');                            
                    }
                }             
            }else{
                if(this.WindowBottom - this.heightBottomGap <= this.TopTriggerFixed + this.heightTopGap || this.WindowBottom >= this.BottomTriggerFixed){
                    this.setStackedEl('scroll',false);
                    if(this.WindowBottom - this.heightBottomGap <= this.TopTriggerFixed + this.heightTopGap){
                        this.SlideBar('delete');                            
                    }else if(this.WindowBottom >= this.BottomTriggerFixed){
                        this.SlideBar('update','lastEl');
                    }
                }else if(this.WindowBottom - this.heightBottomGap >= this.TopTriggerFixed){
                    this.setStackedEl('scroll',true);
                    this.SlideBar('append');
                    if(this.WindowBottom < this.BottomTriggerFixed){
                        this.SlideBar('update','bottom');                            
                    }
                }
            }

        }            
    }

    SetWidthFixed(){
        const $container = this.ElementParent;
        const $findFixedBottom = this.findFixedBottom();
        const $WindowBottom = this.WindowBottom;
        const $BottomTriggerFixed = this.BottomTriggerFixed;
        let $GapLeft = this.GapLeft;
        
        this.TriggerUpdate(true);

        this.TopEl.each(function(){
            $(this).css('width', `${$container.width()}px`);
        });
        this.BottomEl.each(function(){
            $(this).css('width', `${$container.width()}px`);
        });
        
        this.FlexibleWidthTable(this.ElementParent);
        let ResizedTimer;
        if (!ResizedTimer) {
            ResizedTimer = setTimeout(() => {
                const ScrollBar    = $container.find('.scroll-row.last.jspScrollable .jspHorizontalBar');
                if(ScrollBar.length > 0){
                    $container.find('.movedScroll').remove();
                    if($WindowBottom > $BottomTriggerFixed){
                        
                        $container.append(ScrollBar.addClass('movedScroll').css({
                            position    : 'static',
                            paddingLeft : `${$GapLeft}px`
                        }));
                    }else{
                        const heightBaseBottom = $findFixedBottom;
                        $container.append(ScrollBar.addClass('movedScroll').css({
                            position    : 'fixed',
                            paddingLeft : `${$GapLeft}px`,
                            left        : 'auto',
                            width       : 'auto',
                            backgroundColor : 'white',
                            bottom      : `${heightBaseBottom}px`,
                        }));                           
                    }
                }
        
                ResizedTimer = null;
            },3);
        }                    
    }

    TriggerUpdate(resetCount){
        
        if(resetCount){
            this.countChange = 0;
        }

        if(this.countChange === 0){
            this.TopTriggerFixed     = Math.round(this.ElementParent.offset().top),
            this.BottomTriggerFixed  = Math.round(this.TopTriggerFixed + this.ElementParent.outerHeight());
            this.countChange++;
        }
    }

    findFixedTop(){
        let heightFixBefore = 0;
        /* still optional, need improvement */
        $('header').each(function(){
            if($(this.ElementParent).css('position') == 'fixed'){
                heightFixBefore += $(this.ElementParent).height();
            }
        });
        return heightFixBefore;
    }

    findFixedBottom(){
        let heightFixBefore = 0;
         /* still optional, need improvement */
        $('footer').each(function(){
            if($(this.ElementParent).css('position') == 'fixed'){
                heightFixBefore += $(this.ElementParent).height();
            }
        });
        return heightFixBefore;
    }

    setScrollBar(){
        /* move scrollbar */
        let $Gapleft = this.GapLeft;
        this.ElementParent.append(this.ScrollBar.addClass('movedScroll').css({
            position    : 'static',
            paddingLeft : `${$Gapleft}px`
        }));
    }

    setStackedEl(el, status){
        const $container = this.ElementParent;
        if(this.TopEl !== undefined || this.BottomEl !== undefined){
            /* for normal condition */
            if(el === "header"){
                /* checker shadow */
                const ShadowDivTop        = this.ElementParent.find('.shadowDivTop');

                if(status){
                    let heightBaseTop   = this.findFixedTop();
                    const idx             = this.TopEl.length - 1;

                    /* append shadow div */
                    if(ShadowDivTop.length === 0){
                        const Template    = `<div class="shadowDivTop" style="height:${this.heightTopGap}px"></div>`;

                        this.TopEl.eq(idx).after(Template);
                    }

                    this.TopEl.each(function(index){
                        if(index === idx){
                            $(this).addClass('fixed-scroll').addClass('shadow-bottom').css({width: `${$container.width()}px`, top: `${heightBaseTop}px`, position: ''});
                        }else{
                            $(this).addClass('fixed-scroll').css({width: `${$container.width()}px`, top: `${heightBaseTop}px`, position: ''});                                    
                        }
                        heightBaseTop += $(this).height();
                    });
                }else{
                    this.TopEl.each(function(){
                        $(this).removeClass('fixed-scroll').removeClass('shadow-bottom').css('top','');
                    });

                    if(ShadowDivTop.length > 0){
                        ShadowDivTop.remove();
                    }
                }
            }else if(el === 'footer'){
                /* checker shadow */ 
                const ShadowDivBottom        = this.ElementParent.find('.shadowDivBottom');

                if(status){
                    var heightBaseBottom    = this.findFixedBottom();
                    var ScrollBar           = this.ElementParent.find('.movedScroll');

                    ScrollBar.each(function(){
                        $(this).css({
                            position    : 'fixed',
                            left        : 'auto',
                            width       : 'auto',
                            backgroundColor : 'white',
                            bottom      : `${heightBaseBottom}px`,
                        });
                        heightBaseBottom += $(this).height();
                    });

                    for(let i = this.BottomEl.length - 1; i >= 0; i--){
                        $(this.BottomEl[i]).addClass('fixed-scroll').css({width: `${$container.width()}px`, bottom: `${heightBaseBottom}px`});
                        heightBaseBottom += $(this.BottomEl[i]).height();
                    }

                    /* add shadow */
                    this.BottomEl.eq(0).addClass('shadow-top');

                    if(ShadowDivBottom.length === 0){
                        var Template = `<div class="shadowDivBottom" style="height:${this.heightBottomGap}px"></div>`;
                        var idx         = this.BottomEl.length - 1;

                        this.BottomEl.eq(idx).after(Template);
                    }
                }else{
                    var ScrollBar           = this.ElementParent.find('.movedScroll');
                        
                    this.BottomEl.each(function(){
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
                const ShadowDivBottom        = this.ElementParent.find('.shadowDivBottom');
                
                if(status){
                    let heightBaseBottom    = this.findFixedBottom();
                    const ScrollBar           = this.ElementParent.find('.movedScroll');
                    ScrollBar.each(function(){
                        $(this).css({
                            position    : 'fixed',
                            left        : 'auto',
                            width       : 'auto',
                            backgroundColor : 'white',
                            bottom      : `${heightBaseBottom}px`,
                        });
                        heightBaseBottom += $(this).height();
                    });

                    /* shadow div */
                    if(ShadowDivBottom.length === 0){
                        const Template = `<div class="shadowDivBottom" style="height:${this.ScrollBarHeight}px"></div>`;

                        ScrollBar.after(Template);
                    }
                }else{
                    const ScrollBar           = this.ElementParent.find('.movedScroll');
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
    }

    VisibleEl(partial, elem){
        const $t              = $(elem);
        const $w              = this.screen;
        const viewTop         = $w.scrollTop();
        const viewBottom      = viewTop + $w.height();
        const _top            = $t.offset().top;
        const _bottom         = _top + $t.height();
        const compareTop      = partial === true ? _bottom : _top;
        const compareBottom   = partial === true ? _top : _bottom;

        return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
    }

    setEvent(activeConditiion){
        if(activeConditiion){
            if(window.addEventListener) {
                window.addEventListener('scroll', () => {this.ScrollSpyFixed()}, false);
                window.addEventListener('resize', () => {this.SetWidthFixed()}, false);
            } else if (window.attachEvent) {
                window.attachEvent('onscroll', () => {this.ScrollSpyFixed()});
                window.attachEvent('onresize', () => {this.SetWidthFixed()});
            }
        }else{
            window.removeEventListener('scroll', () => {this.ScrollSpyFixed()});
            window.removeEventListener('resize', () => {this.SetWidthFixed()});
        }
    }

    SyncScrollBar(){
        const $container = this.ElementParent;
        const $getPositionPercentX = this.getPositionPercentX;
        if($container.find('.scroll-row.not-last').data('jsp') !== undefined && $container.find('.scroll-row.last').data('jsp') !== undefined ){
            let posLeftLast = $container.find('.scroll-row.not-last').data('jsp').getContentPositionX();
            let Target;
            let checkEnd;

            $container.on('jsp-scroll-x', '.scroll-row.not-last', (event, scrollPositionX, isAtLeft, isAtRight) => {
                $container.find('.scroll-row.last').each(function(){
                    if($(this).data('jsp') !== undefined){
                        $(this).data('jsp').scrollToX(scrollPositionX);
                        posLeftLast = scrollPositionX;
                        checkEnd = isAtRight;
                        const pos = $getPositionPercentX;
                        if(pos !== undefined){
                            window.posState = pos;
                        }
                    }
                });
            });

            $container.on('jsp-scroll-x','.scroll-row.last', function(event, scrollPositionX, isAtLeft, isAtRight){      
                const siblingsrow = $container.find('.scroll-row.not-last .jspPane');
                siblingsrow.css('left',-scrollPositionX);

                posLeftLast = scrollPositionX;
                checkEnd    = isAtRight;

                if($(this).data('jsp') !== undefined){
                    const pos = $getPositionPercentX;
                    if(pos !== undefined){
                        window.posState = pos;
                    }
                }

                if(parseInt(-scrollPositionX) === 0){
                    $container.find('.scroll-row').removeClass('shadow-scroll');   
                }else if(parseInt(-scrollPositionX) < 0){
                    $container.find('.scroll-row').addClass('shadow-scroll');   
                }                

                Target = $container.find('.slideBarScroll');
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
                $container.find('.movedScroll .jspTrack').css({backgroundColor: "#f1f1f1"});
                
                /* for check if user didnt scroll */
                clearTimeout($.data(this, 'scrollTimer'));                
                $.data(this, 'scrollTimer', setTimeout(() => {
                    /* do something */
                    $container.find('.movedScroll .jspTrack').css({backgroundColor: "inherit"});
                }, 250));

            });

            $container.on('mousedown',".jspTrack , .scroll-row.last", () => {
                $container.find('.scroll-row.not-last').each(function(){
                    $(this).data('jsp').scrollToX($container.find('.scroll-row.last').data('jsp').getContentPositionX());
                })
            });

            /* for hovering and active state scrollbar */
            $container.on('mouseover','.movedScroll .jspDrag', function(e){
                $(this).closest('.jspTrack').css({backgroundColor: '#f1f1f1'});
            })
            .on('mouseout','.movedScroll .jspDrag', function(e){
                $(this).closest('.jspTrack').css({backgroundColor: 'inherit'});
            });

            let timeout;
            $container.on('mousedown','.slideBarScroll',() => {                
                
                timeout = setInterval(() => {
                    
                    Target = $container.find('.slideBarScroll');
                    if(Target.css('visibility') === 'hidden'){
                        clearInterval(timeout);
                        return false;
                    }
                    
                    $container.find('.scroll-row.not-last').data('jsp').scrollToX(posLeftLast += 15);
                }, 3);
            })
            .on('mouseup','.slideBarScroll',() => {
                clearInterval(timeout);
                
                Target = $container.find('.slideBarScroll');
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
            $container.find('.scroll-row').unbind();
        }

    }

    SlideBar(actionOption, optionUpdate){

        const barTemplate = `<div class="slideBarScroll" style="height:${this.TopEl.eq(this.TopEl.length - 1).height()}px;"><i class="ta-icon ta-icon-point-right"></i></div>`;
        
        if(actionOption === 'append'){
            if(this.ElementParent.find('.slideBarScroll').length === 0 && this.ElementParent.find('.movedScroll').length > 0){
                this.TopEl.eq(this.TopEl.length - 1).append(barTemplate);
            }
        }else if(actionOption === 'update'){
            /* update height */
            
            let updateHeight;
            if (!updateHeight) {
            updateHeight = setTimeout(() => {
                    
                    if(optionUpdate === 'bottom'){
                        this.ElementParent.find('.slideBarScroll').css({height : `${Math.round((this.WindowBottom - this.heightBottomGap) - this.TopEl.eq(this.TopEl.length - 1).offset().top )}px`});                                
                    }else if(optionUpdate === 'top'){
                        this.ElementParent.find('.slideBarScroll').css({height : `${Math.round((this.BottomTriggerFixed - this.heightBottomGap) - (this.WindowTop + (this.heightTopGap - this.TopEl.eq(this.TopEl.length -1).height())))}px`});                                
                    }else if(optionUpdate === 'lastEl'){
                        this.ElementParent.find('.slideBarScroll').css({height : `${Math.round(this.TopEl[this.TopEl.length - 1].offsetHeight + this.ElementParent.find('.table__wrapper').outerHeight(true) )}px`});                                    
                    }

                    updateHeight = null;
                },.001);
            }  
            
        }else if(actionOption === 'delete'){
            this.ElementParent.find('.slideBarScroll').remove();                
        }
    }

    FlexibleWidthTable(ElementTable){
        const contPar             = $(ElementTable);
        const allHead             = $(ElementTable).find('.table-header-row');
        const headRow             = allHead.has('.table-content');
        const headFirst           = headRow.eq(0).find('.table-content');
        const headFirstFix        = headRow.eq(0).find('.table-content.stay');
        let stayWidth           = 0;
        let allStayWidth        = 0;
        let countStayWidth      = 0;
        let countAllStayWidth   = 0;
        let totalWidthHead      = 0;
        let gapWidth            = 0;
        let elementNotFix       = 0;
        let WidthAdd            = 0;
        const cssAppend           = $('head').find(`#css-flex-${$(ElementTable).attr('id')}`);
        let adjustedCol;
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
                const notCountedCol = headRow.find('.fixed-width').length;
                elementNotFix = countAllStayWidth - notCountedCol;
                adjustedCol = headFirst;
            }else {
                adjustedCol = headRow.eq(0).find('.table-content:not(.stay)');
            }

            gapWidth        = allHead.outerWidth(true) - totalWidthHead;
            WidthAdd        += (gapWidth/elementNotFix);

            
            cssAppend.remove();

            let template =`<style id="css-flex-${$(ElementTable).attr('id')}">`;
            adjustedCol.each(function(i,v){
                if(!$(this).hasClass('fixed-width')){
                    const elHead          = $(this);
                    let elWidth         = elHead.outerWidth(true);
                    const classText       = elHead.data('colName');
                    if(headFirstFix.length == 0 && i == adjustedCol.length-1){
                       elWidth += -0.2;
                    }
                    template += `#${$(ElementTable).attr('id')} .table-content.${classText}{width:${elWidth + WidthAdd}px;}`;
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
            this.setStackedEl('scroll',false);
            contPar.find('.movedScroll').remove();
            this.SlideBar('delete');
        }
    }

    ScrollWindow(pos, timer){
        $('html,body').animate({
            scrollTop: pos
        },timer);
    }

    getPositionPercentX(){
        const pos = this.ElementParent.find('.scroll-row.last').data('jsp').getPercentScrolledX();
        if(pos !== 0 || pos !== -0){
            return pos;
        }
    }

    setPositionPercentX(percent){
        if(this.ElementParent.find('.scroll-row.last').length !== 0){
            if(this.ElementParent.find('.scroll-row.last').data('jsp').scrollToPercentX(percent)){
                return true;
            }else{
                return false;
            }
        }
    }

    setTable(dataset, columnArray){
        try {
            if(typeof dataset == 'object'){
                let templateHeader = '';
                const templateContent = '';
                let tableRowContent = '';
                for (let index = 0; index < dataset[0].length; index++) {
                    templateHeader += '<div class="table-content"></div>';
                }
                for (let index = 0; index < dataset.length; index++) {
                    let tableContent = '';
                    dataset[index].forEach(element => {
                        tableContent+= `<div class="table-content">${element}</div>`;
                    });
                   tableRowContent += `<div class="table-content-row">${tableContent}</div>`;
                }
                this.ElementParent.prepend(`<div class="table__wrapper">${tableRowContent}</div>`)
                this.ElementParent.prepend(`<div class="table-header-row">${templateHeader}</div>`)
            }else{
                console.log('please insert an object');
            }
        }
        catch(err) {
            console.log(err)
            return false;
        }
    }

    setColumnsAttribute(totalFixedColumns, columnArray){
        const columnHeader = this.TopEl.find('.table-content');
        const columnContent = this.ContentEl.find('.table-content');

        /* append scroll row to header */
        columnHeader.filter(index => index >= totalFixedColumns).wrapAll('<div class="scroll-row not-last">'+
                        '<div style="display:flex">');

        /* add class stay to header */
        columnHeader.filter(index => index < totalFixedColumns).addClass('stay');

        columnArray.sort((a, b) => a.colIndex - b.colIndex);

        /* Add default data column */
        for (let index = 1; index < columnArray.length; index++) {
            if(columnArray[index].colIndex && columnArray[index].colIndex - columnArray[index-1].colIndex !== 1){
                const x = columnArray[index].colIndex - columnArray[index-1].colIndex;
                let j = 1;
                while (j<x)
                {
                    const newIndex = parseInt(columnArray[index-1].colIndex+j);
                    const DataAddon = {
                        colIndex: newIndex,
                        title: `Title Kolom-${newIndex}`,
                        className: `classNameCol${newIndex}`
                    };
                    columnArray.push(DataAddon)
                    j++;
                }
            }
        }

        /* Manipulate the header table */
        for (let index = 0; index < columnHeader.length; index++) {
            if(columnArray[index] && columnArray[index].colIndex == index){
                if(columnArray[index].title){
                    columnHeader.eq(columnArray[index].colIndex).prepend(`<span>${columnArray[index].title}</span>`);
                }
                if(columnArray[index].className){
                    columnHeader.eq(columnArray[index].colIndex).addClass(columnArray[index].className).attr('data-col-name',columnArray[index].className);
                }
                if(columnArray[index].tooltip){
                    const tooltipText = columnArray[index].dataTooltip ? columnArray[index].dataTooltip : '';
                    columnHeader.eq(columnArray[index].colIndex).append(`<i class="info-tooltip ta-icon ta-icon-tooltip" data-hover="tooltip" data-original-title="${tooltipText}" data-container="body"></i>`)
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
                columnHeader.eq(index).prepend(`<span>Title Kolom-${index+1}</span>`)
                columnHeader.eq(index).addClass(`classNameCol${index+1}`).attr('data-col-name', `classNameCol${index+1}`)
            }
        }

        /* Manipulate the content table */
        for (let index = 0; index < this.ContentEl.length; index++) {
            if(index == this.ContentEl.length-1){
                var classLast = 'last';
            }else {
                var classLast = 'not-last';
            }
            this.ContentEl.eq(index).find('.table-content').filter(indexCol => indexCol >= totalFixedColumns).wrapAll(`<div class="scroll-row ${classLast}"><div style="display:flex">`);
                                /* add class stay to header */    
            this.ContentEl.eq(index).find('.table-content').filter(index => index < totalFixedColumns).addClass('stay');

            const rowElement = this.ContentEl.eq(index).find('.table-content');
            for (let indexCol = 0; indexCol < rowElement.length; indexCol++) {
                if(columnArray[indexCol] && columnArray[indexCol].colIndex == indexCol){
                    if(columnArray[indexCol].className){
                        rowElement.eq(columnArray[indexCol].colIndex).addClass(columnArray[indexCol].className)
                    }else{
                        rowElement.eq(indexCol).addClass(`classNameCol${indexCol+1}`)
                    }
                }else{
                    rowElement.eq(indexCol).addClass(`classNameCol${indexCol+1}`)
                }    
            } 
        }
    }

    setCustomHeader(customHeader){
        try {
            if(typeof customHeader == 'object'){
                for (let index = 0; index < customHeader.length; index++) {
                    this.ElementParent.prepend(`<div class="table-header-row ${customHeader[index].className}">${customHeader[index].html}</div>`)
                }
            }else{
                console.log('please insert an object');
            }
        }
        catch(err) {
            console.log(err)
            return false;
        }
    }

    destroy() {
        this.setEvent(false);
        this.setStackedEl('header',false);
        this.setStackedEl('footer',false);
        this.setStackedEl('scroll',false);
        this.ElementParent.css('height','');
        this.SlideBar('delete');
        this.ElementParent.find('.movedScroll').remove();
        $('head').find(`#css-flex-${$(this.ElementParent).attr('id')}`).remove();

        this.GapLeft             = 0,
        this.heightTopGap        = 0, 
        this.heightBottomGap     = 0,
        this.TopTriggerFixed     = 0,
        this.BottomTriggerFixed  = 0,
        this.countChange         = 0,         
        this.ScrollChecker       = false,
        this.statusInit          = false,
        this.statusReinit        = true;

        /* destroy api jspan */
        $.each(this.ElementParent.find('.scroll-row'),function() {
            const api = $(this).data('jsp');
            if (api) {
              api.destroy();
            }
        });
        this.apisScrollPane = [];

        /*destroy resize sensor*/
        this.spy.uninstall(this.ElementParent);
    }

    HasBeenInit() {
        return this.statusInit;
    }

    Responsive() {
        if(this.statusInit){
            const $container = this.ElementParent;
            const $spy = elementResizeDetectorMaker({
                            strategy: "scroll",
                            callOnAdd: true,
                            debug: false
                        });
            const $setPositionPercentX = this.setPositionPercentX(window.posState);
            const $SetWidthFixed = this.SetWidthFixed();
            const $TopEl = this.TopEl;
            const $BottomEl = this.BottomEl;
            const $ScrollBar = this.ScrollBar; 
            const $TriggerUpdate = this.TriggerUpdate(true);
            let $heightTopGap = this.heightTopGap;
            let $heightBottomGap = this.heightBottomGap;
            let $ScrollBarHeight = this.ScrollBarHeight;

            $spy.listenTo($container, function(b){
                if($('body').css('overflow') !== 'hidden'){
                   clearTimeout($.data(b, 'scrollTimer11'));              
                    $.data(b, 'scrollTimer11', setTimeout(() => {
                        const length = $($container).find('.scroll-row').length;
                        $($container).find('.scroll-row').each(function(index){
                            let api = $(this).data('jsp');
                            let throttleTimeout;
                            if (!throttleTimeout) {
                                throttleTimeout = setTimeout(() => {
                                    if(api !== undefined){
                                      //  api.reinitialise();
                                    
                                        if(index === (length - 1)){
                                            $setPositionPercentX;
                                        }
                                    }
                                    throttleTimeout = null;
                                },0);
                            }
                        });
                        $SetWidthFixed;
                        $heightTopGap = 0,
                        $heightBottomGap = 0;
                        $ScrollBarHeight = 0;

                        $TopEl.each(function(){
                            $heightTopGap += $(this).height();    
                        });

                        $BottomEl.each(function(){
                            $heightBottomGap += $(this).height();
                        });    

                        $ScrollBar.each(function(){
                            $ScrollBarHeight += $(this).height();
                            $heightBottomGap += $(this).height();
                        });

                        $TriggerUpdate; 
                        
                    }, 10));
            
                }
            });

        }

    }
}

const methods = {
    init:{},destroy:{},HasBeenInit:{},Responsive:{}
}

/**
 * Create the plugin
 * */

$.fn.tatable = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
        console.log(methodOrOptions);
        switch (methodOrOptions) {
            case "init":
                if (!$(this).data('tatable')) {
                    return $(this).data("tatable", new TATable($this, methodOrOptions))
                }
                break;
        
            default:
                break;
        }
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        return this.each(function() {
            const $this = $(this);
            if (!$this.data('tatable')) {
              $this.data('tatable', new TATable($this, methodOrOptions));
            }
        });
    } else {
        $.error( `Method ${methodOrOptions} does not exist on jQuery TATable` );
    }    
};

$.fn.tatable.TATable = TATable;

/* defaults setting */
$.fn.tatable.defaults = {
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

module.exports = TATable;
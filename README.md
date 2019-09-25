# conditional-gtag
Write code to record page views, screen views and events via Google Tags, firing them to Google only if
some initialization says you should record them. Useful to turn on or off based on the deployment environment.

## Use

###initGTag

Initialize google analytics

    initGTag (options = {
        checkFn?: () => boolean;
        disableGlobalScopeCheck?: boolean;
        locationRegEx?: RegExp;
        propertyId?: string, 
    })
   
where **propertyId** is the Id of your property. If you don't provide a property the code looks for the variable

    window.GTAG_PROPERTY_ID
    
on the **window** object. If it doesn't find it, it won't send data to Google Analytics.

If you did provide the property ID as initialization the other potential ways to enable/disable google analytics is:


* **options.disableGlobalScopeCheck**: if set to true, it will not check
    whether **window.USE_GA** is set to true. window.USE_GA is a
    default variable you set server side to enable google analytics
* **options.locationRegEx**: Regular expression that will
    test the window.location.host to decide whether to enable google 
    analytics or not.
    If the option is set and the check fails, GA will not be used
* **options.checkFn**: Function that should return truthy if you want google
    analytics enabled, false otherwise
    
    
### recordScreenRender

Record an app screen

    recordScreenRender(screenName: string)
        
        
### recordEvent

Record an event

    recordEvent (action: string, category?: string, label?: string, value?: number)
        
        
### recordNewView

Record the rendering of a new view

    recordNewView (view: string = window.url.pathname)


## LICENSE

MIT



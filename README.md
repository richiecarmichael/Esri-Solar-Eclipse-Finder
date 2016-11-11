#Solar Eclipse Finder

Solar Eclipse Finder is a JavaScript-based web application that displays past and future [solar eclipses](http://en.wikipedia.org/wiki/Solar_eclipse) that pass through a user defined location.  The source data is published as an [AGOL](http://www.arcgis.com/) hosted service with the paths of 905 solar eclipses from 1601 to 2200.  The eclipse paths were prepared by [Michael Zeiler](http://eclipse-maps.com/Eclipse-Maps/Welcome.html) from data courtesy of [Xavier Jubier](http://xjubier.free.fr/).

The live application is available [here](http://richiecarmichael.github.io/solar/index.html).

Originally developed 2½ years ago as a Silverlight-based web application (see blog posting here), we wanted to confirm that the same performance and advanced symbology is achievable today with HTML5/JavaScript in modern browsers.

##jQuery & Bootstrap
[jQuery](http://jquery.com/) is a JavaScript framework for DOM manipulating.  It is important to note that jQuery is not a prerequisite for mapping apps using [Esri](http://www.esri.com/)‘s [ArcGIS API for JavaScipt](https://developers.arcgis.com/javascript/). It is however a prerequisite of many third party JavaScript libraries like [Bootstrap](http://getbootstrap.com/), a popular user interface framework.  This application uses Bootstap’s [popover](http://getbootstrap.com/javascript/#popovers) tooltips in the fly-out attribute window and its [modal](http://getbootstrap.com/javascript/#modals) dialog during start-up.

##D3
The tapered symbol used by eclipse shadow paths is achieved using a linear gradient fill.  Linear gradient fills are not supported by ArcGIS API for JavaScript.  However linear gradient fills are supported by SVG, the underlying technology used by Esri’s JavaScript API for renderering vectors.  We used [Mike Bostock](http://bost.ocks.org/mike/)‘s [D3.js](http://d3js.org/) JavaScript library to insert and apply linear gradient fills directly to the map’s embedded SVG node.

##Conclusion
Updating this application was a two step process.  First the eclipse dataset was republished as an AGOL hosted feature service and, second, the app was rewritten in HTML/JS.  Both tasks were relatively effortless and only took a couple of days in total.

![](./img/solar.gif)

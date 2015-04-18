/* -----------------------------------------------------------------------------------
   Solar Eclipse Finder
   Develolped by the Applications Prototype Lab
   (c) 2014 Esri | http://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/map',
    'esri/layers/FeatureLayer',
    'esri/tasks/query',
    'dojo/parser',
    'dojo/domReady!'
],
function (
    Map,
    FeatureLayer,
    Query,
    parser
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        // Load digits
        parser.parse();

        // Show tutorial
        $('#dialog-tutorial').modal('show');
        $('#credit-howtouse').click(function () {
            $('#dialog-tutorial').modal('show');
        });
        $('#window').mouseenter(function () {
            stopTimer();
        }).mouseleave(function () {
            startTimer();
        });

        // Tooltips
        $('#panel-date').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'The date the solar eclipse happened or will happen.'
        });
        $('#panel-time').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'The time of day the solar eclipse happened or will happen.'
        });
        $('#panel-duration').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Duration at the point of greatest eclipse.'
        });
        $('#panel-width').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Shadow width on the Earth\'s surface.'
        });
        $('#panel-magnitude').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'The fraction of the sun that his hidden by the Earth\'s shadow. A total eclipse will have magnitude of 1 or greater.'
        });
        $('#panel-sunaltitude').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'The sun\'s altitude and azimuth in the sky.'
        });
        $('#panel-lunation').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Lunation is the number for lunar month. They are numbered sequentially from an arbitrary date.'
        });
        $('#panel-saroscycle').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Saros is the number for the main eclipse cycle, called the Saros cycle.'
        });
        $('#panel-gamma').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Gamma is the measure of whether the eclipse is centered on the equation (gamma = 0), the north pole (gamma = 1), or the south pole (gamma = -1).'
        });
        $('#panel-delta').popover({
            container: 'body', placement: 'left', trigger: 'hover', content: 'Delta-T value (in seconds) for the eclipse date. This is a correction applied because the earth\'s day is not constant, the earth\'s rotation is gradually slowing down because of tidal friction caused by the Moon.'
        });

        // Application constants
        var SOLAR = 'http://services.arcgis.com/6DIQcwlPy8knb6sg/arcgis/rest/services/SolarEclipsePath/FeatureServer/0';
        var _timer = null;

        // Create feature layer
        var fl = new FeatureLayer(SOLAR, {
            mode: FeatureLayer.MODE_SELECTION,
            outFields: [
                'EclType',         // Eclipse Type
                'Date',            // Eclipse Date
                'TimeGE',          // Eclipse Time
                'DurationSeconds', // Duration at Maximum Eclipse (seconds)
                'PathWid',         // Path Width (km)
                'EclMagn',         // Eclipse Magnitude
                'SunAlt',          // Sun Altitude (°)
                'SunAzi',          // Sun Azimuth (°)
                'Lunation',        // Lunation
                'Saro',            // Saros Cycle
                'Gamma',           // Gamma
                'DT'               // Delta-T (seconds)
            ],
            styling: false
        });
        if (fl.surfaceType !== 'svg') {
            alert('This app is not compatiable with this browser.');
            return;
        }
        fl.on('graphic-draw', function (e) {
            d3.select(e.node)
                .attr('fill', function () {
                    var id = e.graphic.attributes.Date < Date.now() ? 'old' : 'new';
                    return 'url(#{0})'.format(id);
                })
                .attr('fill-opacity', '1')
                .on('mouseenter', function () {
                    $('#window-image').attr('src', function () {
                        switch (e.graphic.attributes.EclType) {
                            case 'A':
                            case 'H':
                                return 'img/annular.jpg';
                            case 'T':
                                return 'img/total.jpg';
                            default:
                                return 'img/total.jpg';
                        }
                    });
                    $('#window-type').html(function () {
                        switch (e.graphic.attributes.EclType) {
                            case 'A':
                                return 'Annular Solar Eclipse';
                            case 'H':
                                return 'Hybrid Solar Eclipse';
                            case 'T':
                                return 'Total Solar Eclipse';
                            default:
                                return 'Solar Eclipse';
                        }
                    });
                    $('#window-date').html(new Date(e.graphic.attributes.Date).toLocaleDateString());
                    $('#window-time').html(new Date(e.graphic.attributes.TimeGE).toLocaleTimeString());
                    $('#window-duration').html('{0} seconds'.format(e.graphic.attributes.DurationSeconds));
                    $('#window-width').html('{0} km'.format(e.graphic.attributes.PathWid));
                    $('#window-magnitude').html(e.graphic.attributes.EclMagn);
                    $('#window-sunaltitude').html('{0}°/{1}°'.format(e.graphic.attributes.SunAlt, e.graphic.attributes.SunAzi));
                    $('#window-lunation').html(e.graphic.attributes.Lunation);
                    $('#window-saroscycle').html(e.graphic.attributes.Saro);
                    $('#window-gamma').html(e.graphic.attributes.Gamma);
                    $('#window-delta').html('{0} seconds'.format(e.graphic.attributes.DT));
                    if ($('#window').css('marginRight') !== 0) {
                        $('#window').animate({ marginRight: 0 }, {
                            duration: 300,
                            easing: 'swing',
                            queue: false
                        });
                    }
                    stopTimer();
                    startTimer();
                })
                .on('touchstart', function () {
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('touchmove', function () {
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('touchend', function () {
                    d3.event.sourceEvent.stopPropagation();
                });
        });
        fl.on('click', function (e) {
            e.stopPropagation();
        });

        // Create map
        var map = new Map('map', {
            zoom: 3,
            center: [-30,30],
            basemap: 'gray',
            logo: false
        });
        map.addLayers([fl]);
        map.on('load', function () {
            addLinearGradient('old', '#008080');
            addLinearGradient('new', '#FF8000');
            addLinearGradient('hov', '#0ff');
        });
        map.on('click', function (e) {
            var query = new Query();
            query.geometry = e.mapPoint;
            query.orderByFields = ['Date DESC'];
            fl.selectFeatures(query, FeatureLayer.SELECTION_NEW);
        });

        // Add linear gradient to the map's <defs> node
        function addLinearGradient(name, color) {
            var d = d3.select('#map').select('svg').select('defs');
            var o = d.append('linearGradient')
                .attr('id', name)
                .attr('x1', '0')
                .attr('y1', '0.5')
                .attr('x2', '1')
                .attr('y2', '0.5');
            o.append('stop').attr('offset', '0').attr('stop-color', color).attr('stop-opacity', '0');
            o.append('stop').attr('offset', '0.5').attr('stop-color', color).attr('stop-opacity', '1');
            o.append('stop').attr('offset', '1').attr('stop-color', color).attr('stop-opacity', '0');
        }

        function startTimer() {
            _timer = setTimeout(function () {
                $('#window').animate({ marginRight: -220 }, {
                    duration: 300,
                    easing: 'swing',
                    queue: false
                });
            }, 3000);
        }
        function stopTimer() {
            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }
        }

        // String formating function
        String.prototype.format = function () {
            var s = this;
            var i = arguments.length;
            while (i--) {
                s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
            }
            return s;
        };
    });
});
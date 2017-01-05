/*    
    Copyright 2016 Esri

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

require([
    'esri/map',
    'esri/graphic',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/PictureMarkerSymbol',
    'esri/tasks/query',
    'dojo/domReady!'
],
function (
    Map,
    Graphic,
    FeatureLayer,
    GraphicsLayer,
    SimpleRenderer,
    PictureMarkerSymbol,
    Query
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        // Application constants
        var SOLAR = 'https://services.arcgis.com/6DIQcwlPy8knb6sg/arcgis/rest/services/SolarEclipsePath/FeatureServer/0';

        // Selected graphic
        var _selected = null;

        // Show tutorial
        $('#dialog-tutorial').modal('show');
        $('#credit-howtouse').click(function () {
            $('#dialog-tutorial').modal('show');
        });

        // Tooltips
        $('#panel-date').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'The date the solar eclipse happened or will happen.'
        });
        $('#panel-time').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'The time of day the solar eclipse happened or will happen.'
        });
        $('#panel-duration').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Duration at the point of greatest eclipse.'
        });
        $('#panel-width').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Shadow width on the Earth\'s surface.'
        });
        $('#panel-magnitude').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'The fraction of the sun that his hidden by the Earth\'s shadow. A total eclipse will have magnitude of 1 or greater.'
        });
        $('#panel-sunaltitude').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'The sun\'s altitude and azimuth in the sky.'
        });
        $('#panel-lunation').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Lunation is the number for lunar month. They are numbered sequentially from an arbitrary date.'
        });
        $('#panel-saroscycle').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Saros is the number for the main eclipse cycle, called the Saros cycle.'
        });
        $('#panel-gamma').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Gamma is the measure of whether the eclipse is centered on the equation (gamma = 0), the north pole (gamma = 1), or the south pole (gamma = -1).'
        });
        $('#panel-delta').popover({
            container: 'body',
            placement: 'left',
            trigger: 'hover',
            content: 'Delta-T value (in seconds) for the eclipse date. This is a correction applied because the earth\'s day is not constant, the earth\'s rotation is gradually slowing down because of tidal friction caused by the Moon.'
        });

        // Create feature layer
        var _fl = new FeatureLayer(SOLAR, {
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
        if (_fl.surfaceType !== 'svg') {
            alert('This app is not compatiable with this browser.');
            return;
        }
        _fl.on('graphic-draw', function (e) {
            d3.select(e.node)
                .attr('fill', function () {
                    var format = null;
                    if (_selected === e.graphic) {
                        format = 'hov';
                    }
                    else if (e.graphic.attributes.Date < Date.now()) {
                        format = 'old';
                    } else {
                        format = 'new';
                    }
                    return 'url(#{0})'.format(format);
                })
                .attr('fill-opacity', '1');
        });
        _fl.on('click', function (e) {
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
                        return 'Annular Eclipse';
                    case 'H':
                        return 'Hybrid Eclipse';
                    case 'T':
                        return 'Total Eclipse';
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
            if ($('#window').css('margin-right') !== 0) {
                $('#window').animate({ 'margin-right': 0 }, {
                    start: function () {
                        $(this).show()
                    },
                    duration: 300,
                    easing: 'swing',
                    queue: false
                });
            }

            // Store selected graphic and redraw.
            _selected = e.graphic;
            _fl.redraw();
        });

        // Create pushpin layer
        var _pp = new GraphicsLayer();
        _pp.setRenderer(new SimpleRenderer(new PictureMarkerSymbol({
            angle: 0,
            xoffset: 2,
            yoffset: 8,
            type: 'esriPMS',
            imageData: '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',
            width: 24,
            height: 24
        })));

        // Create map
        var _map = new Map('map', {
            zoom: 3,
            center: [-30, 30],
            basemap: 'gray',
            logo: false
        });
        _map.addLayers([
            _fl,
            _pp
        ]);
        _map.on('load', function () {
            addLinearGradient('old', '#008080');
            addLinearGradient('new', '#FF8000');
            addLinearGradient('hov', '#0ff');
        });
        _map.on('click', function (e) {
            // Exit if a graphic is clicked.
            if (e.graphic) { return; }

            // Clear selection
            _selected = null;

            // Hide the attribute window (if shown).
            $('#window').animate({ 'margin-right': -175 }, {
                duration: 300,
                easing: 'swing',
                queue: false,
                complete: function () {
                    $(this).hide();
                }
            });

            // Add pushpin at clicked location.
            _pp.clear();
            _pp.add(new Graphic(e.mapPoint));

            // Display all intersecting eclipse paths.
            var query = new Query();
            query.geometry = e.mapPoint;
            query.orderByFields = ['Date DESC'];
            _fl.selectFeatures(query, FeatureLayer.SELECTION_NEW);
        });

        // Add linear gradient to the map's <defs> node
        function addLinearGradient(name, color) {
            var d = d3.select('#map').select('svg').select('defs');
            var o = d.append('linearGradient')
                .attr('id', name)
                .attr('x1', '0')
                .attr('y1', '0.5')
                .attr('x2', '1.0')
                .attr('y2', '0.5');
            o.append('stop').attr('offset', '0').attr('stop-color', color).attr('stop-opacity', '0');
            o.append('stop').attr('offset', '0.5').attr('stop-color', color).attr('stop-opacity', '1');
            o.append('stop').attr('offset', '1.0').attr('stop-color', color).attr('stop-opacity', '0');
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

COLORS = ["black", "blue", "red", "green"]


/**
 * Update data with new posit parameters.
 *
 * Regenerates set of posits, splits them into positive, negative, zero, and
 * infinity; attaches new set of data to the viz.
 */
function update(contianer, width, height, n, es, format) {
    const posits = generatePositsOfLength(n, es);

    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    const zero = posits.filter(p => p.value === 0.0);
    const infinity = posits.filter(p => p.value === Infinity);
    console.assert(zero && infinity);
    console.assert(positivePosits.length === negativePosits.length);
    console.assert(positivePosits.length + negativePosits.length + 2 === 2**n);
    drawProjectiveRealsLine(container, width, height, n, es, format);
    createLegend(container);

    // Here, we need to use d3 to select markers along the number lines, and
    // assign the data to the markers.
    // I think we'll have a .positiveDot class for the dots on the positive
    // line, and a .negativeDot class for the dots on the negative line.
    // Then, we need to set the markers' position attributes based on the
    // posit's position in the sorted list.
}

function setAttrs(nodes, sign, x_center, y_center, dtheta, markerId, radius) {
    var fill = 'none';
    var strokeWidth = '2';
    if (sign) {
        nodes
            .attr('d', (d) => generateArcFromPosit(x_center, y_center, radius,
                dtheta, sign, d))
            .attr('class', 'negativePositPath')
            .attr('fill', fill)
            .attr('stroke', 'orange')
            .attr('stroke-width', strokeWidth)
            .attr('marker-end', 'url(#' + markerId + ')');
    } else {
        nodes
            .attr('d', (d) => generateArcFromPosit(x_center, y_center, radius,
                dtheta, sign, d))
            .attr('class', 'positivePositPath')
            .attr('fill', fill)
            .attr('stroke', 'blue')
            .attr('stroke-width', strokeWidth)
            .attr('marker-end', 'url(#' + markerId + ')');
    }
}

function drawInfinityDot(container, x_center, y_center, radius, infinity, format) {
    var infinityDot = container.selectAll('.infDot').data(infinity);
    var text_radius = radius + 15 + 5 * (infinity[0].bitstring.length - 2)


    var dotText = (format == label_format.FRACTION) ? "Infinity" : ((d) => d.bitstring.join(""));
    infinityDot.enter().append('circle')
        .attr('class', 'infDot')
        .attr('cx', x_center)
        .attr('cy', y_center - radius)
        .attr('r', 5)
        .attr('fill', 'black');

    infinityDot
        .attr('class', 'infDot')
        .attr('cx', x_center)
        .attr('cy', y_center - radius)
        .attr('r', 5)
        .attr('fill', 'black');

    infinityDot.exit().remove();

    text = container.selectAll('.infText').data(infinity)
    text.enter().append('text')
        .attr('class', 'infText')
        .attr('x', x_center)
        .attr('y', y_center - text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(dotText);

    text
        .attr('class', 'infText')
        .attr('x', x_center)
        .attr('y', y_center - text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(dotText);

    text.exit().remove()
}

function drawZero(container, x_center, y_center, radius, zero, format) {
    var zeroDot = container.selectAll('.zeroDot').data(zero);
    var text_radius = radius + 15 + 5 * (zero[0].bitstring.length - 2)

    zeroDot.enter().append('circle')
        .attr('class', 'zeroDot')
        .attr('cx', x_center)
        .attr('cy', y_center + radius)
        .attr('r', 5)
        .attr('fill', 'black');

    zeroDot.attr('class', 'zeroDot')
        .attr('cx', x_center)
        .attr('cy', y_center + radius)
        .attr('r', 5)
        .attr('fill', 'black');

    zeroDot.exit().remove();
    zero_text = (format == label_format.FRACTION) ? "0" : ((d) => d.bitstring.join(""));

    text = container.selectAll('.zeroText').data(zero);
    text.enter().append('text')
        .attr('class', 'zeroText')
        .attr('x', x_center)
        .attr('y', y_center + text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(zero_text);

    text.attr('class', 'zeroText')
        .attr('x', x_center)
        .attr('y', y_center + text_radius)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .text(zero_text);
    text.exit().remove();
}


function calculateRadius(n) {
    var radius = ((n/2) * 100) + (n**1.2 * 5);
    return radius
}

function calculateDTheta(n) {
    var dtheta = 178/(1 << (n-1));
    return dtheta;
}

function drawFractionLabels(container, width, height, n, es) {
    var dtheta = calculateDTheta(n)
    var radius = calculateRadius(n)
    var x_center = width/2;
    var y_center = radius;
    
    const posits = generatePositsOfLength(n, es);
    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    var text_radius = radius + 15 + 5 * (posits[0].bitstring.length - 2)

    var texts = container.selectAll('.negativeDot').data(negativePosits);
    texts.enter().append('text')
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'negativeDot')
        .text((d) => decodePosit(d.bitstring, n, es).value);
    texts
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'negativeDot')
        .text((d) => decodePosit(d.bitstring, n, es).value);

    texts.exit().remove();

    texts = container.selectAll('.positiveDot').data(positivePosits);
    texts.enter().append('text')
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 0, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 0, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'positiveDot')
        .text((d) => decodePosit(d.bitstring, n, es).value);
    texts
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 0, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 0, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'positiveDot')
        .text((d) => decodePosit(d.bitstring, n, es).value);
    texts.exit().remove();
}

function drawBitstringLabels(container, width, height, n, es) {
    var dtheta = calculateDTheta(n)
    var radius = calculateRadius(n)
    var x_center = width/2;
    var y_center = radius;
    
    const posits = generatePositsOfLength(n, es);
    console.log(posits)
    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    var text_radius = radius + 15 + 5 * (posits[0].bitstring.length - 2)
    var texts;

    // negative labels
    texts = container.selectAll('.negativeDot').data(negativePosits)
    texts
        .enter().append('text')
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'negativeDot')
        .text((d) => d.rawBitfields.sign.join(""))
        .append("tspan")
        .style("fill", "blue")
        .text((d) => d.rawBitfields.regime.join(""))
        .append("tspan")
        .style("fill", "red")
        .text((d) => d.rawBitfields.exponent.join(""))
        .append("tspan")
        .style("fill", "green")
        .text((d) => d.rawBitfields.fraction.join(""));
    texts
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'negativeDot')
        .style("fill", COLORS[0])
        .text((d) => d.rawBitfields.sign.join(""))
        .append("tspan")
        .style("fill", COLORS[1])
        .text((d) => d.rawBitfields.regime.join(""))
        .append("tspan")
        .style("fill", COLORS[2])
        .text((d) => d.rawBitfields.exponent.join(""))
        .append("tspan")
        .style("fill", COLORS[3])
        .text((d) => d.rawBitfields.fraction.join(""));
    texts.exit().remove()

    texts = container.selectAll('.positiveDot').data(positivePosits)
    texts
        .enter().append('text')
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'positiveDot')
        .style("fill", COLORS[0])
        .text((d) => d.rawBitfields.sign.join(""))
        .append("tspan")
        .style("fill", COLORS[2])
        .text((d) => d.rawBitfields.regime.join(""))
        .append("tspan")
        .style("fill", COLORS[3])
        .text((d) => d.rawBitfields.exponent.join(""))
        .append("tspan")
        .style("fill", COLORS[4])
        .text((d) => d.rawBitfields.fraction.join(""));
    texts
        .attr('x', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).x)
        .attr('y', (d) => getDotCoordsFromPosit(x_center, y_center,
            text_radius, dtheta, 1, d).y)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('class', 'positiveDot')
        .style("fill", COLORS[0])
        .text((d) => d.rawBitfields.sign.join(""))
        .append("tspan")
        .style("fill", COLORS[1])
        .text((d) => d.rawBitfields.regime.join(""))
        .append("tspan")
        .style("fill", COLORS[2])
        .text((d) => d.rawBitfields.exponent.join(""))
        .append("tspan")
        .style("fill", COLORS[3])
        .text((d) => d.rawBitfields.fraction.join(""));
    texts.exit().remove()
}

function createLegend(container) {
    const color = d3.scaleOrdinal()
        .range([COLORS[0], COLORS[1], COLORS[2], COLORS[3]])
        .domain(["Sign","Regime","Exponent","Fraction"]);

    const legend = container
        .selectAll(".legend")
        .data(color.domain())
        .enter()
        .append('g')
        .attr("class", "legend")
        .attr("transform", function(d,i) {
            return `translate(0, ${i * 20})`;
        });

    legend.append('rect')
        .attr('class', 'legend-rect')
        .attr('x', width + margin.right-12)
        .attr('y', 65)
        .attr('width', 12)
        .attr('height', 12)
        .style('fill', color)

    legend.append("text")
        .attr('class', 'legend-text')
        .attr("x", width + margin.right-22)
        .attr("y", 70)
        .style('font-size', "12px")
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;});
}

function getDotCoordsFromPosit(x_center, y_center, radius, dtheta, sign, posit) {
    var posit_as_int = unsignedIntegerFromBitstring(posit.bitstring);
    var infVal = 2**(posit.bitstring.length - 1);
    var end_angle;
    if (sign === 0) {
        end_angle = 180 - (dtheta * posit_as_int)
    } else {
        // Semi-hacky correction so that negative posits go
        // from most negative to least negative
        if (posit.value != Infinity) { posit_as_int = Math.abs(infVal - (posit_as_int - infVal));}
        end_angle = 180 + (dtheta * (posit_as_int))
    }
    return polarToCartesian(x_center, y_center, radius, end_angle);
}

/**
 * Draw the projective reals line on an SVG.
 * @param svgSelection - the d3 selection of the SVG element.
 */
function drawProjectiveRealsLine(container, width, height, n, es, format) {
    // An assumption I'm making right now.
    console.assert(width === height);

    // Create a defs block; define arrowhead and dot markers.
    var arrowheadMarker = createArrowheadMarker();
    var arrowheadMarkerId = d3.select(arrowheadMarker).attr('id');
    // var reverseArrowheadMarker = createReverseArrowheadMarker();
    // var reverseArrowheadMarkerId = d3.select(reverseArrowheadMarker).attr('id');
    var dotMarker = createDotMarker();
    var dotMarkerId = d3.select(dotMarker).attr('id');

    // This weird syntax is what d3 expects:
    // https://stackoverflow.com/questions/23110366/d3-append-with-variable
    var defs = container.append('defs');
    defs.append(function () {return arrowheadMarker;});
    defs.append(function(){return dotMarker;});

    const posits = generatePositsOfLength(n, es);

    const positivePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 0)
        .sort(positCompare);
    const negativePosits = posits.filter(posit => posit.actualValueBitfields && posit.actualValueBitfields.sign[0] === 1)
        .sort(positCompare);
    const infinity = posits.filter(p => p.value === Infinity);
    const zero = posits.filter(p => p.value === 0.0);

    var dtheta = calculateDTheta(n);
    var radius = calculateRadius(n); 
    var x_center = width/2;
    var y_center = radius;

    var positivePaths = container.selectAll('.positivePositPath')
        .data(positivePosits);
    setAttrs(positivePaths, 0, x_center, y_center, dtheta, dotMarkerId, radius);
    setAttrs(positivePaths.enter().append('path'), 0,
        x_center, y_center, dtheta, dotMarkerId, radius);
    // add the last arc with an arrowhead
    var posFinalArc = container.append('path').data(infinity)
    setAttrs(posFinalArc, 0, x_center, y_center, dtheta, arrowheadMarkerId, radius);
    positivePaths.exit().remove();

    var negativePaths = container.selectAll('.negativePositPath')
        .data(negativePosits);
    setAttrs(negativePaths, 1, x_center, y_center, dtheta, dotMarkerId, radius);
    setAttrs(negativePaths.enter().append('path'), 1,
        x_center, y_center, dtheta, dotMarkerId, radius);
    negativePaths.exit().remove();
    // Add the final arc with an arrowhead
    var negFinalArc = container.append('path').data(infinity)
    setAttrs(negFinalArc, 1, x_center, y_center, dtheta, arrowheadMarkerId, radius);

    if (displayFormat === label_format.FRACTION) {
        drawFractionLabels(container, width, height, n, es);
    }
    else {
        drawBitstringLabels(container, width, height, n, es);
    }

    drawZero(container, x_center, y_center, radius, zero, format)
    drawInfinityDot(container, x_center, y_center, radius, infinity, format)
}

function generateArcFromPosit(x_center, y_center, radius, dtheta, sign, posit) {
    var posit_as_int, start_angle, end_angle;
    // draw arcs in the positive direction
    var posit_as_int = unsignedIntegerFromBitstring(posit.bitstring);
    var infVal = 2**(posit.bitstring.length - 1);
    if (sign === 0) {
        start_angle = 180 - (dtheta * (posit_as_int - 1))
        end_angle = 180 - (dtheta * posit_as_int)
    } else {
        // Semi-hacky correction so that negative posits go
        // from most negative to least negative
        if (posit.value != Infinity) { posit_as_int = Math.abs(infVal - (posit_as_int - infVal));}
        start_angle = 180 + (dtheta * (posit_as_int - 1))
        end_angle = 180 + (dtheta * (posit_as_int))
    }
    return describeArc(x_center, y_center, radius, sign, start_angle, end_angle)
}

/**
 * Following two functions based on this:
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

/* Angles start at the top of the circle and go clockwise, we drawn arcs for positive
 * numbers counter-clockwise and arcs for negative numbers clockwise.
 * If sign is 0, the arc is drawn from start->end otherwise we drawn from end->start
 * x and y are coordinates of the center
 *
 * https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
 */
function describeArc(x, y, radius, sign, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, startAngle);
    var end = polarToCartesian(x, y, radius, endAngle);

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, 0, sign, end.x, end.y
    ].join(" ");
    return d;
}

/**
 * Create an arrowhead <marker> element to be appended to an <svg> (within a
 * <defs>).
 * See https://vanseodesign.com/web-design/svg-markers/.
 */
function createArrowheadMarker() {
    var id = 'arrowhead';
    var markerWidth = '10';
    var markerHeight = '10';
    var refX = '7';
    var refY = '3';
    var orient = 'auto';
    var markerUnits = 'strokeWidth';

    // See https://stackoverflow.com/questions/28734628/how-can-i-set-an-attribute-with-case-sensitive-name-in-a-javascript-generated-el
    // We create an XML element instead of an HTML element. HTML attributes are
    // case-insensitive, and so the attributes below get lowercased if we don't
    // do this.
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    d3.select(marker)
        .attr('id', id)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('orient', orient)
        .attr('markerUnits', markerUnits)
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', 'black');

    return marker;
}


/**
 * Create a dot <marker> element to be appended to an <svg> (within a <defs>).
 */
function createDotMarker() {
    var id = 'dot';
    var markerWidth = '10';
    var markerHeight = '10';
    var refX = '5';
    var refY = '5';
    var orient = 'auto';
    var markerUnits = 'strokeWidth';
    var radius = '3';

    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    d3.select(marker)
        .attr('id', id)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerHeight)
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('orient', orient)
        .attr('markerUnits', markerUnits)
        .append('circle')
        .attr('cx', '5')
        .attr('cy', '5')
        .attr('r', radius)
        .attr('fill', 'black');

    return marker;
}

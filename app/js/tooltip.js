import $ from 'jquery';

module.exports = function(color, entry) {
    var location = entry.location;
    if (entry.supplement) {
        location = location + ' - ' + entry.supplement;
    }

    const tooltip = $('<div class="event-tooltip-content">' +
        '<div class="tooltip-location" style="color:' + color + '"></div>' +
        '<div class="tooltip-comment"></div>' +
        '</div>');
    tooltip.find('.tooltip-location').text(location);
    tooltip.find('.tooltip-comment').text(entry.comment);

    return tooltip;
}

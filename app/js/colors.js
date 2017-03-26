import marker from './entrymarker';

const markToColor = [];
markToColor[marker.NONE] = 'rgb(30, 200, 20)';
markToColor[marker.WARN] = 'rgb(255, 150, 0)';
markToColor[marker.ERROR] = 'rgb(255, 50, 50)';

module.exports = {
    fromMark: markToColor
}

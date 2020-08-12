// bottom of the game -- status bar
function StatusBar() {

  return {
    setMaze: setMaze,
    setPosition: setPosition,
    setMoveCount: setMoveCount,
    setRoom: setRoom
  }

  function setMaze(maze) {
    document.getElementById('current-maze').innerText = maze.name;
    setMoveCount(0);
    setPosition(maze.startingPosition);
  }

  function setMoveCount(c) {
    document.getElementById('move-count').innerText = c;
  }

  function setPosition(position) {
    document.getElementById('current-position').innerText = position[0] + ', ' + position[1];
  }

  function setRoom(room) {
    document.getElementById('current-room').innerText = room;
  }
}

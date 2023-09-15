
class piece {
    constructor(pos, grids) {
        this.x = pos[0]
        this.y = pos[1]
        this.rotationIndex = 3
        this.grids = grids
    }

    currentGrid() {
        return this.grids[this.rotationIndex]
    }
}

export class I extends piece {
    constructor() {
        super([3, 18], [
            [[2, 0], [2, 1], [2, 2], [2, 3]],
            [[0, 2], [1, 2], [2, 2], [3, 2]],
            [[1, 0], [1, 1], [1, 2], [1, 3]],
            [[0, 1], [1, 1], [2, 1], [3, 1]],
        ])
    }
}
export class O extends piece {
    constructor() {
        super([3, 17], [
            [[1, 1], [2, 1], [1, 2], [2, 2]],
            [[1, 1], [2, 1], [1, 2], [2, 2]],
            [[1, 1], [2, 1], [1, 2], [2, 2]],
            [[1, 1], [2, 1], [1, 2], [2, 2]],
        ])
    }
}
export class L extends piece {
    constructor() {
        super([3, 18], [
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 1], [1, 1], [2, 1], [0, 2]],
            [[0, 0], [1, 0], [1, 1], [1, 2]],
            [[2, 0], [0, 1], [1, 1], [2, 1]],
        ])
    }
}
export class J extends piece {
    constructor() {
        super([3, 18], [
            [[1, 0], [2, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [0, 2], [1, 2]],
            [[0, 0], [0, 1], [1, 1], [2, 1]],
        ])
    }
}
export class S extends piece {
    constructor() {
        super([3, 18], [
            [[1, 0], [1, 1], [2, 1], [2, 2]],
            [[1, 1], [2, 1], [0, 2], [1, 2]],
            [[0, 0], [0, 1], [1, 1], [1, 2]],
            [[1, 0], [2, 0], [0, 1], [1, 1]],
        ])
    }
}
export class Z extends piece {
    constructor() {
        super([3, 18], [
            [[2, 0], [1, 1], [2, 1], [1, 2]],
            [[0, 1], [1, 1], [1, 2], [2, 2]],
            [[1, 0], [0, 1], [1, 1], [0, 2]],
            [[0, 0], [1, 0], [1, 1], [2, 1]],
        ])

    }
}
export class T extends piece {
    constructor() {
        super([3, 18], [
            [[1, 0], [1, 1], [2, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [1, 2]],
            [[1, 0], [0, 1], [1, 1], [1, 2]],
            [[1, 0], [0, 1], [1, 1], [2, 1]],
        ])
    }
}

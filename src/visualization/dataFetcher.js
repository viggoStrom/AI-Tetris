
const map = document.getElementById("map")
const inputs = document.querySelectorAll("div input")

const readTransfer = async () => {
    const response = await fetch("transfer.json")
    return await response.json()
}

readTransfer().then(result => {
    const flatMap = result.map.flat()
    flatMap.forEach(cell => {
        const node = document.createElement("div")
        node.style.backgroundColor = cell === 1 ? "white" : "black"
        map.appendChild(node)
    });
})

// DO HTTP COMMUNICATION!
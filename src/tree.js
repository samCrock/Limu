// Get JSON data
// treeJSON = d3.json('data.js', function(error, treeData) {

// Calculate total nodes, max label length
let totalNodes = 0;
let maxLabelLength = 0;
// variables for drag/drop
let selectedNode = null;
// panning variables
let panSpeed = 200;
// Misc. variables
let i = 0;
let duration = 750;
let root;

// size of the diagram
let viewerWidth = $(document).width();
let viewerHeight = $(document).height();

let tree = d3.layout.tree()
    .size([viewerHeight, viewerWidth]);

// define a d3 diagonal projection for use by the node paths later on.
let diagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.y, d.x];
    });

// A recursive helper function for performing some setup by walking through all nodes
function visit(parent, visitFn, childrenFn) {
    if (!parent) return;

    visitFn(parent);

    let children = childrenFn(parent);
    if (children) {
        let count = children.length;
        for (let i = 0; i < count; i++) {
            visit(children[i], visitFn, childrenFn);
        }
    }
}

// Call visit function to establish maxLabelLength
visit(treeData, function (d) {
    totalNodes++;
    maxLabelLength = Math.max(d.name.length, maxLabelLength);

}, function (d) {
    return d.children && d.children.length > 0 ? d.children : null;
});


// sort the tree according to the node names
function sortTree() {
    tree.sort(function (a, b) {
        return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
    });
}

// Sort the tree initially in case the JSON isn't in a sorted order.
// sortTree();

// Define the zoom function for the zoomable tree
function zoom() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}


// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
let zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

// define the baseSvg, attaching a class for styling and the zoomListener
let baseSvg = d3.select("#tree-container").append("svg")
    .attr("width", viewerWidth)
    .attr("height", viewerHeight)
    .attr("class", "overlay")
    .call(zoomListener);

// Helper functions for collapsing and expanding nodes.
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function expand(d) {
    if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
    }
}

let overCircle = function (d) {
    selectedNode = d;
};
let outCircle = function (d) {
    selectedNode = null;
};

// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
function centerNode(source) {
    scale = zoomListener.scale();
    x = -source.y0;
    y = -source.x0;
    if (!source.parent) {
        x = x * scale + viewerWidth / 10;
        y = y * scale + (viewerHeight / 2 + 20);
        // console.log('init', x, y);
    } else if (!source.children) {
        x = -source.parent.y0 * scale + viewerWidth / 4;
        y = -source.parent.x0 * scale + viewerHeight / 2;
        // console.log('close', source);
    } else {
        x = -source.y0 * scale + viewerWidth / 4;
        y = -source.x0 * scale + viewerHeight / 2;
        // console.log('open', source.children[0]);
    }


    // console.log(source);

    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
}

// Toggle children function
function toggleChildren(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else if (d._children) {
        d.children = d._children;
        d._children = null;
    }
    return d;
}

// Toggle children on click.
function click(d) {
    if (d3.event.defaultPrevented) return; // click suppressed
    d = toggleChildren(d);
    update(d);
    centerNode(d);
}

function update(source) {
    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    let levelWidth = [1];
    let childCount = function (level, n) {
        // console.log(level, n);

        if (n.children && n.children.length > 0) {

            if (levelWidth.length <= level + 1) {
                levelWidth.push(0);
            }

            levelWidth[level + 1] += n.children.length;

            n.children.forEach(function (d) {
                childCount(level + 1, d);
            });

        }

    };
    childCount(0, root);
    let newHeight = d3.max(levelWidth) * 60; // 60 pixels per line
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    let nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);


    // Set widths between levels based on maxLabelLength.
    nodes.forEach(function (d) {
        d.y = (d.depth * (maxLabelLength * 8)); //maxLabelLength * 10px
        // alternatively to keep a fixed scale one can set a fixed depth per level
        // Normalize for fixed-depth by commenting out below line
        d.y = (d.depth * 400); //500px per level.
    });

    // Update the nodes…
    node = svgGroup.selectAll('g.node')
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

    nodeEnter.append("circle")
        .attr('class', 'nodeCircle')
        .attr("r", 0)
        .style("fill", function (d) {
            return d._children ? "var(--nodeStroke)" : "var(--nodeFill)";
        });

    nodeEnter.append("text")
        .attr("x", function (d) {
            return d.children || d._children ? -10 : 10;
        })
        .attr("dy", ".35em")
        .attr('class', 'nodeText')
        .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function (d) {
            return d.name;
        })
        .style("fill-opacity", 0);

    // phantom node to give us mouseover in a radius around it
    nodeEnter.append("circle")
        .attr('class', 'ghostCircle')
        .attr("r", 30)
        .attr("opacity", 0.2) // change this to zero to hide the target area
        .attr('pointer-events', 'mouseover')
        .on("mouseover", function (node) {
            overCircle(node);
        })
        .on("mouseout", function (node) {
            outCircle(node);
        });

    // Update the text to reflect whether node has children or not.
    node.select('text')
        .attr("x", function (d) {
            return d.children || d._children ? -10 : 10;
        })
        .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function (d) {
            return d.name;
        });

    // Change the circle fill depending on whether it has children and is collapsed
    node.select("circle.nodeCircle")
        .attr("r", 4.5)
        .style("fill", function (d) {
            return d._children ? "var(--nodeStroke)" : "var(--nodeFill)";
        });

    // Transition nodes to their new position.
    let nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    // Fade the text in
    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    let nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 0);

    nodeExit.select("text")
        .style("fill-opacity", 0);

    // Update the links…
    let link = svgGroup.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            let o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr('d', diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr('d', function (d) {
            let o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    processLevelBoxes();

}

function processLevelBoxes() {
    // Process levelBoxes
    let nodesByLevel = d3.nest().key(function (d) {
        return d.depth
    }).entries(tree.nodes(root).reverse());
    // console.log(nodesByLevel);
    svgGroup.selectAll('.levelBox')
        .data(nodesByLevel)
        .exit()            // one box per level
        .remove();
    svgGroup.selectAll('.levelBox')
        .data(nodesByLevel)
        .enter()            // one box per level
        .append('text')
        .attr('class', 'levelBox')
        .attr('x', function (d) {
            // console.log(d.values[0]);
            if (d.values[0].depth > 1) {
                return d.values[0].depth * 400;
            } else {
                return d.values[0].parent ? d.values[0].parent.x : 0;
            }
        }) //take the x of the first node in this layer
        .text(function (d) {
            return d.values[0].category;
        }); //the key from the nesting, i.e. the depth
}


// Append a group which holds all nodes and which the zoom Listener can act upon.
let svgGroup = baseSvg.append('g').attr('class', 'main-group');

// Define the root
root = treeData;
root.x0 = viewerHeight / 2;
root.y0 = 0;

// Layout the tree initially and center on the root node.
update(root);
centerNode(root);
// });

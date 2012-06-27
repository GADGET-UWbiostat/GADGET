// script for gene search page
// requires jquery

// string variables "q", "genes", "species", "usehomologs" and "orderby"
// declared on html page (from query string arguments)

var initialLimit = 100;
var limit = 100;
var offset = 0;

var abstractlimit = 15;

// build the query string and redirect to a page with the new ordering
function order(key)
{
    var querystring = "q=" + q + "&genes=" + genesyms + "&species=" + species + "&usehomologs=" + usehomologs + "&orderby=" + key;
    window.location = "genesearch?" + querystring;
}

// collapse the slider panes in the gene results table for a specific gene
function hidepanes(gene)
{
    $("#generank tr#abstracts" + gene + " td div").slideUp('fast', function() { $("#generank tr#abstracts" + gene).hide(); });
    $("#generank tr#eventpreview" + gene + " td div").slideUp('fast', function() { $("#generank tr#eventpreview" + gene).hide(); });
    $("#generank tr#crossrefs" + gene + " td div").slideUp('fast', function() { $("#generank tr#crossrefs" + gene).hide(); });
    $("#generank a#showabs" + gene).text("Show abstracts");
}

$(document).ready(function()
{
    var queryString = "q=" + q + "&genes=" + genes + "&species=" + species + "&usehomologs=" + usehomologs + "&orderby=" + orderby + "&limit=" + initialLimit;
    offset += initialLimit;
    
    // get initial results
    spin();
    $.getJSON("genelist", queryString)
    .success(function(data)
    {
        if (data.validresult)
        {
            // append new genes to table, show "more" button
            $("#generank").append(data.result);
            stripetables();
            
            $("div#description").show();
            $("#results").fadeTo(200, 1);
            $("table#download").fadeIn('slow');
            
            $("#more").show();
            hideflash();        
        }
        else
        {
            // display error message
            flash(data.errmsg);
        }
    })
    .error(function() {flasherror();} );
    
    // get and display more genes when the "more" button gets clicked
    $("input#more").click(function()
    {
        var queryString = "q=" + q + "&genes=" + genes + "&species=" + species + "&usehomologs=" + usehomologs + "&orderby=" + orderby + "&limit=" + limit + "&offset=" + offset;
        offset += limit;
        
        // get more genes
        spin();
        $.getJSON("genelist", queryString)
        .success(function(data)
        {
            if (data.validresult)
            {
                // append new genes to table
                $("#generank").append(data.result);
                stripetables();
                hideflash();
            }
            else
            {
                // If "validresult" is false, we ran out of genes.  (Ot
                flash("No more genes match your query.");
                $("#more").hide(); 
            }
        })
        .error(function() 
        {
            flasherror();
            $("#more").hide();    
        });
        
    });
    
    
    // show / hide abstracts when abstracts icon gets clicked
    $("#generank").delegate("a.showabstracts", "click", function()
    {
        var gene = $(this).attr("gene");
        var sym = $(this).attr("genesymbol");
        
        if ($("#generank tr#abstracts" + gene).length == 0) // see if the tr for absracts exists
        {
            // the abstracts pane doesn't exist.
            hidepanes(gene); // hide other panes
            
            // how many abstracts for this gene?
            var abstractcount = $("tr#gene" + gene).attr("hits");

            // assemble querystring
            var querystring = "q=" + q + "&genes=" + genes + "," + gene + "&genesyms=" + genesyms + ',' + sym + "&species=" + species + "&usehomologs=" + usehomologs + "&unique=" + gene + "&orderby=relevance" + "&abstractcount=" + abstractcount; 
            
            // set up abstract pane
            $("#generank tr#gene" + gene).after('<tr class="pane abstracts" id="abstracts' + gene + '"><td colspan="13"><img src="/static/spinner2.gif"></td></tr>');
            
            // change link text
            $(this).text("Hide abstracts");

            // fetch and display abstracts
            $.get("abstractview.html", querystring)
            .success(function(result)
            {
                    // append abstracts to td
                    $("#generank tr#abstracts" + gene + " td img").remove(); // hide spinner
                    $("#generank tr#abstracts" + gene + " td").html(result); 
                    $("#generank tr#abstracts" + gene + " td").append('<a href="javascript:void(0);" class="hidepanes" gene="' + gene + '">Hide abstracts</a>');
                    
                    $("#generank tr#abstracts" + gene + " td div").slideDown();
                    fetchabstracts(gene);
                
            })
            .error(function() 
            {
                flash("An error occurred!  Please check your internet connection and try again.  If the error persists, please contact us.");
            });
        }
        else // the abstract pane exists
        {
            // is the abstracts pane hidden?
            if (!$("#generank tr#abstracts" + gene).is(":visible"))
            {
                // the abstract pane exists but is hidden
                // show the abstract pane
                hidepanes(gene);
                $("#generank tr#abstracts" + gene).show();
                $("#generank tr#abstracts" + gene + " td div").slideDown();

                $(this).text("Hide abstracts");
            }
            else
            {
                // the abstract exists and is visible
                // hide the abstract pane
                hidepanes(gene);
            }
        }
    });
    
        
    // show or hide events when the events button gets clicked
    $("#generank").delegate("a.showeventpreview", "click", function()
    {
        var gene = $(this).attr("gene");
        var sym = $(this).attr("genesymbol");
        
        if ($("#generank tr#eventpreview" + gene).length == 0) // see if the tr for events exists
        {
            // hide other panes
            hidepanes(gene);
        
            // the tr for events doesn't exist, so make one
            $("#generank tr#gene" + gene).after('<tr class="pane eventpreview" id="eventpreview' + gene + '"><td colspan="13"><div><img src="/static/spinner2.gif"></div></td></tr>');
        
            // assemble querystring
            var querystring = "q=" + q + "&gene_symbols=" + genesyms + ',' + sym + "&detail=" + sym + "&limit=3&preview=1";
            
            // fetch and display event preview
            $.get("eventlist.html", querystring)
            .success(function(result)
            {
                $("#generank tr#eventpreview" + gene + " td div").remove(); // hide spinner
                $("#generank tr#eventpreview" + gene + " td").html('<div style="display:none; padding-top:5px;">' + result + '</div>');
                $("#generank tr#eventpreview" + gene + " td").append('<a href="javascript:void(0);" class="hidepanes" gene="' + gene + '">Hide interactions</a>');
                $("#generank tr#eventpreview" + gene + " td div").slideDown();
            })
            .error(function()
            {
                $("#generank tr#eventpreview" + gene + " td div").remove(); // hide spinner
                $("#generank tr#eventpreview" + gene + " td").html('<div></div>');
                hidepanes(gene);
                flash("An error occurred!  Please check your internet connection and try again.  If the error persists, please contact us.");
            });
        }
        else // the tr for events exists
        {
            // is the events pane hidden?
            if (!$("#generank tr#eventpreview" + gene).is(":visible"))
            {
                // the events pane exists but is hidden
                // show the events pane
                hidepanes(gene);
                $("#generank tr#eventpreview" + gene).show();
                $("#generank tr#eventpreview" + gene + " td div").slideDown();
            }
            else
            {
                // the events pane is visible, so hide it
                hidepanes(gene);
            }
        }
    });
    
    
    // show or hide external links (cross references) when the button gets clicked
    $("#generank").delegate("a.showcrossrefs", "click", function()
    {
        var gene = $(this).attr("gene");
        var sym = $(this).attr("genesymbol");
        
        if ($("#generank tr#crossrefs" + gene).length == 0) // see if the tr for crossrefs exists
        {
            hidepanes(gene); // hide other panes
            
            // the tr for crossrefs doesn't exist, so make one
            $("#generank tr#gene" + gene).after('<tr class="pane crossrefs" id="crossrefs' + gene + '"><td colspan="13"><div><img src="/static/spinner2.gif"></div></td></tr>');
        
            // assemble querystring
            var querystring = "gene=" + gene + "&genesymbol=" + sym;
            
            // fetch and display crossrefs
            $.getJSON("genecrossrefs", querystring)
            .success(function(data)
            {
                $("#generank tr#crossrefs" + gene + " td div").remove(); // hide spinner
                if (data.validresult)
                {
                    // display the cross references 
                    $("#generank tr#crossrefs" + gene + " td").html('<div style="display:none; padding-top:5px;">' + data.result + '</div>');
                    $("#generank tr#crossrefs" + gene + " td").append('<a href="javascript:void(0);" class="hidepanes" gene="' + gene + '">Hide external links</a>');
                    $("#generank tr#crossrefs" + gene + " td div").slideDown();
                }
                else
                {
                    // collapse the pane, show an error message
                    $("#generank tr#crossrefs" + gene + " td").html('<div></div>');
                    hidepanes(gene);
                    flash("An error occurred!  Please check your internet connection and try again.  If the error persists, please contact us.");
                }
            })
            .error(function()
            {
                $("#generank tr#crossrefs" + gene + " td div").remove(); // hide spinner
                $("#generank tr#crossrefs" + gene + " td").html('<div></div>');
                hidepanes(gene);
                flash("An error occurred!  Please check your internet connection and try again.  If the error persists, please contact us.");
            });
            
        }
        else // the tr for crossrefs exists
        {
            // is the crossrefs pane hidden?
            if (!$("#generank tr#crossrefs" + gene).is(":visible"))
            {
                // the crossrefs pane exists but is hidden
                // show the crossrefs pane
                hidepanes(gene);
                $("#generank tr#crossrefs" + gene).show();
                $("#generank tr#crossrefs" + gene + " td div").slideDown();
            }
            else
            {
                // the crossrefs pane is visible, so hide it
                hidepanes(gene);
            }
        }
    });


    // hide the pane when the "hide" link gets clicked
    $("#generank").delegate("a.hidepanes", "click", function()
    {
        var gene = $(this).attr("gene");
        hidepanes(gene);
    });
});


// preserve initial form values so the form matches the results on page load
// (without this, the form values get messed up when the user presses the back button.)

var initialquery = null;
var initialgenes = null;
var initialspecies = null;
var initialhomologs = null;

$(window).bind('pageshow', function() {
    if (initialquery == null) {initialquery = $("input#id_q").val();}
    else {$("input#id_q").val(initialquery);}
    
    if (initialgenes == null) {initialgenes = $("input#id_genes").val();}
    else {$("input#id_genes").val(initialgenes);}
    
    if (initialspecies == null) {initialspecies = $("select#id_species").val();}
    else {$("select#id_species").val(initialspecies);}
    
    if (initialhomologs == null) {initialhomologs = $("input#id_usehomologs").attr("checked");}
    else {$("input#id_usehomologs").attr("checked", initialhomologs);}
});

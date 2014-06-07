window.onload = function() {
    "use strict";
    $(document).ready(function() {

        var mesotabs = function() {
            return {
                init: function() {
                    var self = this,
                            ul = $("ul.tabs");

                    ul.each(function() {
                        var set = false,
                                li = $(this).find("li");

                        li.each(function() {
                            var a = $(this).find("a:first");

                            (a.attr("class") === "current") ? set = true : "";
                        });
                        if (!set) {
                            self.repairTabs($(this), $(this).next("div.panes"));
                        }
                        try {
                            if (typeof expandContent === "function") {
                                var contents = $(".contentSection");

                                contents.each(function() {
                                    expandContent({
                                        elem: $(this),
                                        maxHgt: 300,
                                        collHgt: 250,
                                        ctaBtn: 'See more, See less',
                                        btnBg: false
                                    });
                                });
                            }
                        }
                        catch (e) {
                        }
                    });
                },
                repairTabs: function(ul, container) {
                    var self = this,
                            content = container.find("div.tab-content"),
                            li = ul.find("li"),
                            opts = {"content": content, "li": li, "ul": ul},
                    find = (self.needToSetHash(li)) ? true : false,
                            hash = (find) ? self.getHashToSet(li) : "";

                    $.each(li, function(i) {
                        var a = $(this).find("a:first"),
                                id = a.attr("id"),
                                href = a.attr("href");

                        if (!find) {
                            if (i === 0) {
                                a.attr("class", "current");
                                $(content[i]).show();
                            }
                            else {
                                a.removeAttr("class");
                                $(content[i]).hide();
                            }
                        }
                        else {
                            if (a.attr("href") === hash) {
                                a.attr("class", "current");
                                $(content[i]).show();
                            }
                            else {
                                a.removeAttr("class");
                                $(content[i]).hide();
                            }
                        }

                        a.bind("click", function(e) {
                            return self.changeHandler(e, $(this), opts);
                        });
                        a.attr("href", "#");
                    });
                },
                changeHandler: function(e, caller, opts) {
                    e.preventDefault();
                    var self = this,
                            index = 0;
                    $.each(opts.li, function(i) {
                        var a = $(this).find("a:first");
                        if (a.attr("id") === caller.attr("id")) {
                            index = i;
                            a.attr("class", "current")
                        }
                        else {
                            a.removeAttr("class");
                        }

                    });
                    opts.content.each(function() {
                        $(this).hide();
                    });
                    $(opts.content[index]).show();

                    try {
                        var c = opts.content.find(".contentSection:first");

                        expandContent({
                            elem: c,
                            maxHgt: 300,
                            collHgt: 250,
                            ctaBtn: 'See more, See less',
                            btnBg: false
                        });
                    } catch (e) {
                    }
                    ;
                    return false;
                },
                needToSetHash: function(li) {
                    var find = false;
                    li.each(function() {
                        (window.location.hash.indexOf($(this).find("a:first").attr("href")) >= 0) ? find = true : "";
                    });
                    return find;
                },
                getHashToSet: function(li) {
                    var hash = "";
                    li.each(function() {
                        (window.location.hash.indexOf($(this).find("a:first").attr("href")) >= 0) ? hash = $(this).find("a:first").attr("href") : "";
                    });
                    //now remove the hash
                    window.location.hash = window.location.hash.replace(hash, "");
                    return hash;
                },
                hasHash: function(href) {
                    return (window.location.hash.indexOf(href) >= 0);
                }
            }
        };
        var m = new mesotabs();
        m.init();
    });
}

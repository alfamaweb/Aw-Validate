var tablink = '';
chrome.tabs.onCreated.addListener(function (tab) {
});

chrome.tabs.getSelected(null, function (tab) {
    tablink = tab.url;
});


var $dom = '';
var manifest = chrome.runtime.getManifest();
$('#version').html(manifest.version + 'v');

function gravarToken(dados) {
    $dom = dados.dom;
    validarimgs();
}

var totalImg = 0;
var ImageData = Array();

var totalJs = 0;
var JSData = Array();
var cssData = Array();


function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " Bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
    else return (bytes / 1073741824).toFixed(3) + " GB";
};


function getFileSize(address, dataVar) {

    $.ajax({
        type: "HEAD",
        async: true,
        url: address,
    }).done(function (message, text, jqXHR) {
        dataVar.push([address, jqXHR.getResponseHeader('Content-Length')]);
        endSizes();
    });
}

function endSizes() {
    var somaImg = 0;
    var somaJs = 0;
    var somaCss = 0;

    var imgSemHead = 0;
    var imgComHead = 0;

    if (ImageData.length > 1) {

        for (var i = 0; i < ImageData.length; i++) {
            if (ImageData[i][1]) {
                if (ImageData[i][1] <= 20) {
                    imgSemHead++;
                } else {
                    somaImg = parseFloat(somaImg) + parseFloat(ImageData[i][1]);
                    imgComHead++;
                }
            } else {
                imgSemHead++;
            }
        }

    }
    if (JSData.length > 1) {

        for (var i = 0; i < JSData.length; i++) {
            if (JSData[i][1]) {
                somaJs = parseFloat(somaJs) + parseFloat(JSData[i][1]);
            }
        }
    }

    if (cssData.length > 1) {
        for (var i = 0; i < cssData.length; i++) {
            if (cssData[i][1]) {
                somaCss = parseFloat(somaCss) + parseFloat(cssData[i][1]);
            }
        }
    }


    $('#totalSizeCss').html('Css: <b>' + formatBytes(somaCss) + '</b>');
    $('#totalSizeJs').html('Scripts: <b>' + formatBytes(somaJs) + '</b>');
    $('#totalSizeImg').html('Img ' + imgComHead + ': <b>' + formatBytes(somaImg) + '</b><br>Imagens sem tamanho definido:<b>' + imgSemHead + '</b>');

    $('#totalSize').html('total: ' + formatBytes(somaImg+somaCss+somaJs));


}

$(document).ready(function () {

    chrome.tabs.executeScript(null, {file: "content.js"}, function (result) {
        if (chrome.runtime.lastError) {
            return;
        }
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {text: "getDOM"}, gravarToken);
        });
    });

});

var dados = '';

function validarimgs() {

    var parser = new DOMParser();
    var doc = parser.parseFromString($dom, "text/html");


    dados += '<h2>Imagens</h2>';
    dados += '<span> Total de imagens ' + $('img', $dom).length + '</span>';
    var $imgs = 0;
    totalImg = $('img', $dom).length;
    $('img', $dom).each(function () {
        var attrs = $(this).attr('alt');
        var srcurl = $(this).attr('src');

        if (attrs) {
            if (attrs == '') {
                $imgs++;
            }
        } else {
            $imgs++;
        }

        var caminho = srcurl;
        if (caminho.indexOf('http') < 0) {
            caminho = tablink + '/' + srcurl;
        }
        getFileSize(caminho, ImageData);
        // }
    });

    if ($imgs != 0) {
        dados += '<span class="tx-red">img sem alt: ' + $imgs + '</span>';
    } else {
        dados += '<span class="tx-green">Alt perfeito' + '</span>';
    }

    $imgs = 0;
    $('img', $dom).each(function () {
        var attrs = $(this).attr('title');
        if (attrs) {
            if (attrs == '') {
                $imgs++;
            }
        } else {
            $imgs++;
        }
    });

    if ($imgs != 0) {
        dados += '<span class="tx-red">img sem title: ' + $imgs + '</span>';
    } else {
        dados += '<span class="tx-green">title perfeito' + '</span>';
    }


    dados += '<h2>Links</h2>';
    dados += '<span>Total de links ' + $('a', $dom).length + '</span>';

    var $link = 0;
    var $linktitle = 0;
    $('a', $dom).each(function () {
        var attrs = $(this).attr('href');
        if (attrs == '#' || attrs == '') {
            $link++;
        }
        var attrs2 = $(this).attr('title');
        if (attrs || attrs2 == '') {
            $linktitle++;
        }
    });

    if ($link != 0) {
        dados += '<span class="tx-red">Href com problemas: ' + $link + '</span>';
    } else {
        dados += '<span class="tx-green">Href perfeito' + '</span>';
    }

    ;

    if ($linktitle != 0) {
        dados += '<span class="tx-red">sem title: ' + $linktitle + '</span>';
    } else {
        dados += '<span class="tx-green">title perfeito' + '</span>';
    }


    dados += '<h2>Form</h2>';
    dados += '<span>Total de inputs ' + $('input', $dom).length + '</span>';


    dados += '<h2>Sizes</h2>';
    dados += '<span class="" id="totalSizeJs">Total: Carregando</span>';
    dados += '<span class="" id="totalSizeCss">Total: Carregando</span>';
    dados += '<span class="" id="totalSizeImg">Total: Carregando</span>';
    dados += '<span class="" id="totalSize">Total: Carregando</span>';


    dados += '<h2>Metas</h2>';
    var viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) {
        dados += '<span class="tx-red">sem Meta viewport</span>';
    } else {
        dados += '<span class="tx-green">Tem viewport</span>';
    }

    var metadesc = doc.querySelector('meta[name="description"]');
    if (!metadesc) {
        dados += '<span class="tx-red">sem Meta description</span>';
    } else {
        dados += '<span class="tx-green"> Meta description ok.</span>';
    }

    var metakey = doc.querySelector('meta[name="keywords"]');
    if (!metakey) {
        dados += '<span class="tx-red">sem Meta Keywords</span>';
    } else {
        dados += '<span class="tx-green">Meta Keywords ok.</span>';
    }


    var metaauthor = doc.querySelector('meta[name="author"]');
    if (!metaauthor) {
        dados += '<span class="tx-red">sem Meta Author</span>';
    } else {
        dados += '<span class="tx-green">Meta Author ok.</span>';
    }


    var pos1 = 0;
    dados += '<h2>Basico</h2>';


    pos1 = $dom.indexOf('GoogleAnalyticsObject');
    if (pos1 <= 0) {
        dados += '<span class="tx-red"> Não tem o Analytics</span>';
    } else {
        dados += '<span class="tx-green">Analytics OK.</span>';
    }

    pos1 = $dom.indexOf('Copyright');
    if (pos1 <= 0) {
        dados += '<span class="tx-red"> Não tem Copyright</span>';
    } else {
        dados += '<span class="tx-green">Copyright ok.</span>';
    }

    pos1 = $dom.indexOf('alfamaweb.com.br');
    if (pos1 <= 0) {
        dados += '<span class="tx-red"> Não tem o link da alfamaweb</span>';
    } else {
        dados += '<span class="tx-green">Link Alfamaweb.com.br ok.</span>';
    }

    pos1 = $dom.indexOf('ipsum');
    if (pos1 <= 0) {
        dados += '<span class="tx-green">livre de Lorem ipsum</span>';
    } else {
        dados += '<span class="tx-red">Conteudo Lorem Ipson</span>';
    }

    pos1 = $dom.indexOf('localhost/');
    if (pos1 <= 0) {
        dados += '<span class="tx-green">livre de Localhost</span>';
    } else {
        dados += '<span class="tx-red">Conteudo com localhost</span>';
    }


    dados += '<h2>Social</h2>';

    var paragraphs = doc.querySelector('meta[property="og:image"]');
    var scritps = doc.querySelectorAll('script:not([src=""])');
    var links = doc.querySelectorAll('link:not([href=""])');
    //var viewport = doc.querySelector('meta[name="viewport"]');


    for (var i = 0; i < scritps.length; i++) {
        var arquivo = $(scritps[i]).attr('src');
        if (arquivo) {
            totalJs++;
            if (arquivo.indexOf('http') < 0) {
                arquivo = tablink + '/' + arquivo;
            }
        }
        getFileSize(arquivo, JSData);
    }

    for (var i = 0; i < links.length; i++) {
        var arquivo = $(links[i]).attr('href');
        if (arquivo) {
            if (arquivo.indexOf('http') < 0) {
                arquivo = tablink + '/' + arquivo;
            }
        }
        getFileSize(arquivo, cssData);
    }


    var meta2 = $(paragraphs).attr('content');

    var og_locale = doc.querySelector('meta[property="og:locale"]');
    var og_type = doc.querySelector('meta[property="og:type"]');
    var og_title = doc.querySelector('meta[property="og:title"]');
    var og_description = doc.querySelector('meta[property="og:description"]');
    var og_url = doc.querySelector('meta[property="og:url"]');
    var og_site_name = doc.querySelector('meta[property="og:site_name"]');
    var og_img = doc.querySelector('meta[property="og:image"]');


    var twitcard = doc.querySelector('meta[name="twitter:card"]');
    var twittitle = doc.querySelector('meta[name="twitter:title"]');
    var twitdesc = doc.querySelector('meta[name="twitter:description"]');
    var twitsrc = doc.querySelector('meta[name="twitter:image:src"]');


    dados += '<span class="">Facebook</span>';

    if (!og_locale) {
        dados += '<span class="tx-red">sem OG:Locale</span>';
    } else {
        dados += '<span class="tx-green">og:Locale: ' + $(og_locale).attr('content') + '</span>';
    }

    if (!og_type) {
        dados += '<span class="tx-red">sem OG:Type</span>';
    } else {
        dados += '<span class="tx-green">og:Type: ' + $(og_type).attr('content') + '</span>';
    }

    if (!og_title) {
        dados += '<span class="tx-red">sem OG:Title</span>';
    } else {
        dados += '<span class="tx-green">og:Title: ' + $(og_title).attr('content') + '</span>';
    }

    if (!og_description) {
        dados += '<span class="tx-red">sem OG:description</span>';
    } else {
        dados += '<span class="tx-green">og:Description:<br>' + $(og_description).attr('content') + '</span>';
    }

    if (!og_url) {
        dados += '<span class="tx-red">sem OG:url</span>';
    } else {
        dados += '<span class="tx-green">og:url:<br>' + $(og_url).attr('content') + '</span>';
    }
    if (!og_site_name) {
        dados += '<span class="tx-red">sem OG:Site_name</span>';
    } else {
        dados += '<span class="tx-green">og:site_name: ' + $(og_site_name).attr('content') + '</span>';
    }

    if (!og_img) {
        dados += '<span class="tx-red">sem OG:IMG</span>';
    } else {
        dados += '<span class="tx-green">og:IMG:<br>' + $(og_img).attr('content') + '</span>';
        dados += '<span> <img src="' + $(og_img).attr('content') + '" width="100%" height="auto" alt=""></span>';
    }

    dados += '<span class="wo-bg"><a href="javascript:void(0)" id="btcacheFacebook" >Cache do facebook</a></span>';


    dados += '<span class="">Twitter</span>';
    if (!twitcard) {
        dados += '<span class="tx-red">sem twitter:card</span>';
    } else {
        dados += '<span class="tx-green">twitter:card: ' + $(twitcard).attr('content') + '</span>';
    }

    if (!twittitle) {
        dados += '<span class="tx-red">sem twitter:title</span>';
    } else {
        dados += '<span class="tx-green">twitter:title: ' + $(twittitle).attr('content') + '</span>';
    }
    if (!twitdesc) {
        dados += '<span class="tx-red">sem twitter:description</span>';
    } else {
        dados += '<span class="tx-green">twitter:description: ' + $(twitdesc).attr('content') + '</span>';
    }
    if (!twitsrc) {
        dados += '<span class="tx-red">sem twitter:image:src</span>';
    } else {
        dados += '<span class="tx-green">twitter:image:src: ' + $(twitsrc).attr('content') + '</span>';
        dados += '<span> <img src="' + $(twitsrc).attr('content') + '" width="100%" height="auto" alt=""></span>';
    }

    dados += '<span class="wo-bg"><a href="javascript:ovoid(0)" id="btcacheTwitter" >Cache do Twitter</a></span>';

    exibirDados();
}


function exibirDados() {

    $('#resultados').html(dados);
    $('#btcacheFacebook').click(function () {
        chrome.tabs.create({
            "url": 'https://developers.facebook.com/tools/debug/og/object?q=' + tablink,
            "selected": true
        });
    });
    $('#btcacheTwitter').click(function () {
        chrome.tabs.create({"url": 'https://cards-dev.twitter.com/validator', "selected": true});
    });

}







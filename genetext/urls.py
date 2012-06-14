from django.conf.urls.defaults import *
import eventview.eventview as ev
import geneview.geneview as gv
import geneview.genecrossrefs as gxr
import abstracts.abstracts as ab

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    (r'^gadget/genesearch', gv.searchpage),
    (r'^gadget/genelist', gv.genesearch),
    (r'^gadget/genecrossrefs', gxr.genecrossrefs2),
    (r'^gadget/abstractview', ab.abstractview),
    (r'^gadget/abstracts', ab.abstracts),
    (r'^gadget/eventsearch', ev.search),
    (r'^gadget/eventlist', ev.eventlist),
    (r'^gadget/eventgenes', ev.eventgenes),
    (r'^gadget/eventsummary', ev.eventsummary),
    (r'^gadget/eventplot', ev.plot),
    (r'^gadget/eventthumb', ev.thumb),
    (r'^gadget/xml', ev.xml),
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', 
        {'document_root': '/home/genetext/gadget/static'}),
    (r'^$', 'django.views.static.serve', 
        {'document_root': '/home/genetext/gadget/www', 'path':'index.html'}),    
    (r'^(?P<path>.*)$', 'django.views.static.serve', 
        {'document_root': '/home/genetext/gadget/www'}),
    
    # Example:
    # (r'^genetext/', include('genetext.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/', include(admin.site.urls)),
)

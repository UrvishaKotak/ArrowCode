import datetime
import simplejson,io
import numpy as np
import matplotlib.pyplot as plt
import netCDF4
import pdb
import random
import os

def rot2d(x, y, ang):
    '''rotate vectors by geometric angle'''
    xr = x*np.cos(ang) - y*np.sin(ang)
    yr = x*np.sin(ang) + y*np.cos(ang)
    return xr, yr

def roms_surface_vectors(location, tinds=np.arange(70,80)):
    """ Return the surface velocites from a netcdf grid location
    for all time indices.
    """
    nc = netCDF4.Dataset(location)

    # Get the grid angle used to rotate the vectors
    ang = nc.variables['angle'][:]

    # Get grid at the model 'psi' points
    lon_psi = nc.variables['lon_psi'][:]
    lat_psi = nc.variables['lat_psi'][:]
    
    # Average angles to psi points
    ang_psi = 0.25*(ang[1:, 1:] + ang[1:, :-1] + ang[:-1, 1:] + ang[:-1, :-1])
    
   # tinds = np.arange(60,70)
    timestamps = nc.variables['ocean_time'][tinds]
    nt = len(timestamps)
    nlon, nlat = lon_psi.shape
    
    Nskip = 3
    mask_psi = nc.variables['mask_psi'][::Nskip, ::Nskip]
    lon_skip = lon_psi[::Nskip, ::Nskip]
    lat_skip = lat_psi[::Nskip, ::Nskip]
    
    if not os.path.isfile('C://Users/Urvisha/Desktop/leaflet/random_index.npy'):
            
            idx = np.arange((mask_psi==1).sum())
            #pdb.set_trace()
            np.random.shuffle(idx)
            #pdb.set_trace()
            np.save('C://Users/Urvisha/Desktop/leaflet/random_index.npy', idx)
    else:
            idx = np.load('C://Users/Urvisha/Desktop/leaflet/random_index.npy')
            pdb.set_trace()
            idx = idx.astype(int)
            
    lonm = lon_skip[mask_psi == 1][idx]
    latm = lat_skip[mask_psi == 1][idx]
        
    ur = np.empty((lonm.size, nt))
    vr = np.empty((lonm.size, nt))
    
    
    
    for i, tidx in enumerate(tinds):
        
        # Get the surface velocities at the specified time index
        u = nc.variables['u'][tidx, -1, :, :]
        v = nc.variables['v'][tidx, -1, :, :]

        #u, v = octant.tools.shrink(u, v)

        #print u;
        # average veloceties to psi points
        u_psi = 0.5*(u[1:, :] + u[:-1, :])
        v_psi = 0.5*(v[:, 1:] + v[:, :-1])
        #pdb.set_trace()
        # rotate velocities
        utemp, vtemp = rot2d(u_psi, v_psi, ang_psi)
        
        utemp = utemp[::Nskip, ::Nskip]
        vtemp = vtemp[::Nskip, ::Nskip]
        
        #pdb.set_trace()

       
        
        
        #print mask_psi
        
        
        ur[:,i] = utemp[mask_psi == 1][idx]
        vr[:,i] = vtemp[mask_psi == 1][idx]
     

    return lonm, latm, ur, vr, timestamps

    #return lon_psi, lat_psi, ur, vr, timestamps


def vectors_to_json(x, y, u, v, t):
    """ Generate json for velocity vectors defined by u, v at locations
    x, y and timestamps t
    """
    #pdb.set_trace()
    # convert unix timestamps to ISO 8601 strings
    time = [datetime.datetime.utcfromtimestamp(timestamp).isoformat()
            for timestamp in t]
    
    points = []
    #print u.shape
    ni = len(x)
    count=0
    
    for i in xrange(ni):
            
            if(count<300):
                print u[i,:]
                size = np.sqrt(u[i,:]**2 + v[i,:]**2)
                angle = np.arctan2(v[i,:], u[i,:])
                point = {'point': [{'latLng' : [x[i], y[i]],
                        'size' : size.tolist(),
                        'angle' : angle.tolist()}]}
                points.append(point)
                count = count+1
    result = {'arrow' : {'time' : time,
                         'points' : points}}
    return simplejson.dumps(result)


if __name__ == '__main__':
    # Show a single timestamp
    #tidx = np.arange(60,70)
    # Open some random netCDF file
    location = 'http://barataria.tamu.edu:8080/thredds/dodsC/NcML/txla_nesting6.nc'
    lon_psi, lat_psi, ur, vr, t = roms_surface_vectors(location)
    json = vectors_to_json(lon_psi, lat_psi, ur, vr, t)
    with io.open('C://Users/Urvisha/Desktop/leaflet/data.json', 'w', encoding='utf-8') as f:
        f.write(unicode(json))
    
roms2json

--Consulta Ruta Entrega(recolex)
select 
u.nombre,fechaRecoleccion,d.nombre,cp,estado,municipio,colonia,calle,num_exterior
from
users u join driver o on u.idUser=o.idDriver
natural join collections
natural join donors d
where
fechaRecoleccion=Hoy and idDriver=idEDOARDO and recolectado=0;

--Formulario registro recolección
select 
donors.nombre
from
collections natural join donors
where idDriver=idEDOARDO and fechaRecoleccion=Hoy and idDonor=Tiendaselect

--confirmacion nota
select
folio,fechaRecoleccion,responsableEntrega,d.nombre,d.calle,cantidad
from 
donors d natural join collections c
join collectedQuantities cq using(idCollection)
where idCollection=lakseacabadeinsertar

--Consulta vacia/consulta ruta de entrega
select
u.nombre,w.nombre,cp,municipio,colonia,calle,num_exterior,cantidad
select
u.nombre,w.nombre,cp,municipio,colonia,calle,numExterior,cantidad
from
users u join driver o on u.idUser=o.idDriver
natural join warehousesAssignations wa
natural join warehouses w
join assignedQuantities aq on aq.idWarehousesAssignations=wa.idWarehousesAssignations
where fecha=hoy and idDriver=idEDOARDO

--Consulta entregados
select 
u.nombre,fechaRecoleccion,d.nombre,cp,estado,municipio,colonia,calle,num_exterior
from
users u join driver o on u.idUser=o.idDriver
natural join collections
natural join donors d
where
fechaRecoleccion=Hoy and idDriver=idEDOARDO and recolectado=1;

--Consulta entregas(receptor)
select
u.nombre,w.nombre,u2.nombre,u2.apellidoP,vehicle.placa,cantidad
from
users u join receivers r on u.idUser=r.idReceiver
natural join warehouses w
natural join warehousesAssignations wa
natural join assignedQuantities
join driver o on o.idDriver= wa.idWarehousesAssignations
join users u2 on u2.idUser=o.idDriver
join collections c on c.idCollection=o.idDriver
join vehicle on vehicle.idVehicle=c.idCollection
where
fecha=hoy and idReceiver=receptor

--Confirmacion donativo/Modificacion donativo
select
u.nombre,u.apellidoP,u.apellidoM,idDriver,vehicle.placa,cantidad
from
users u join driver o on u.idUser=o.idDriver
natural join warehousesAssignations wa
natural join assignedQuantities aq
join collections c on c.idDriver=o.idDriver
join vehicle on vehicle.idVehicle=c.idVehicle
where idCollection=lakes

--Gestionar usuario
select
nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
from
users u join driver o on u.idUser=o.idDriver
join receivers r on i.idReceiver=u.idUser
join trafficCoordinators t on u.idUser=t.idTrafficCoordinator;

select
nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
from
users u join driver o on u.idUser=o.idDriver
join receivers r on i.idReceiver=u.idUser
join trafficCoordinators t on u.idUser=t.idTrafficCoordinator
where nombre like "ABC" or apellidoM like "ABC" or apellidoP like "ABC";

select
nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
from
users u join driver o on u.idUser=o.idDriver
join receivers r on i.idReceiver=u.idUser
join trafficCoordinators t on u.idUser=t.idTrafficCoordinator
order by nombre asc;

select
nombre,apellidoM,apellidoP,idDriver,idReceiver,idTrafficCoordinator
from
users u join driver o on u.idUser=o.idDriver
join receivers r on i.idReceiver=u.idUser
join trafficCoordinators t on u.idUser=t.idTrafficCoordinator
order by nombre desc;

select
nombre,apellidoM,apellidoP
from
users u left join driver o on o.idDriver=u.idUser
where idDriver is not null;

select
nombre,apellidoM,apellidoP
from
users u left join receivers r on i.idReceiver=u.idUser
where idReceiver is not null;

select
nombre,apellidoM,apellidoP
from
users u left join trafficCoordinators t on u.idUser=t.idTrafficCoordinator
where idTrafficCoordinator is not null;

--Borrar usuario/Editar usuario
select
*
from
users
where
idUser=idEDOARDO;

--Confirmacion deshabilitacion usuario/edicion
select
nombre,apellidoP,apellidoM
from
users
where
idUser=idEDOARDO;

--Gestionar Donadores
select
nombre,cp,estado,colonia,calle,num_exterior
from 
donors
order by nombre asc;

select
nombre,cp,estado,colonia,calle,num_exterior
from 
donors
order by nombre desc;

select
nombre,cp,estado,colonia,calle,num_exterior
from 
donors
where
nombre like "ABC";

select
nombre,cp,estado,colonia,calle,num_exterior
from 
donors
where
tipo=tipo;

--Modal Donador
select
idDonor,nombre,cp,estado,colonia,calle,num_exterior,contacto
from 
donors
where
idDonor=idDonor;

--Confirmacion deshabilitacionDonador/edicion
select
nombre
from
donors
where
idDonor=idDonor;

--EditarDonador
select
*
from
Donors;

--Gestionar unidades
select
placa,modelo
from
vehicle
where
idVehicle=idVehicle
order by placa asc

select
placa,modelo
from
vehicle
where
idVehicle=idVehicle
order by placa desc

select
placa,modelo
from
vehicle
where
placa like "ABC"

select
placa,modelo
from
vehicle
where
idVehicle=idVehicle
order by placa desc

select
placa,modelo
from
vehicle
where
idVehicle=idVehicle
order by vencimientoPoliza asc

select
placa,modelo
from
vehicle
where
idVehicle=idVehicle
order by vencimientoPoliza desc

--Modal unidad/editar unidad
select
*
from
vehicle
where
idVehicle=idVehicle

--Confirmar edicion/deshabilitacion
select
placa
from
vehicle
where
idVehicle=idVehicle;

--Gestionar Rutas
select
nombre,count(d.idRoute)
from
Routes
natural join donors d
order by nombre asc;

select
nombre,count(d.idRoute)
from
Routes
natural join donors d
order by nombre desc;

select
nombre,count(d.idRoute)
from
Routes
natural join donors d
order by count(d.idRoute) asc;

select
nombre,count(d.idRoute) as num
from
Routes
natural join donors d
order by count(d.idRoute) desc;

--Modalruta
select
r.nombre,count(d.idRoute),d.nombre,cp,estado,municipio,colonia,calle,num_exterior
from
Routes r natural join donors d
where idRoute=idRoute

--EliminarRuta/Editar
select
nombre
from
Routes
where
idRoute=idRoute

--AsignarRecoleccion
select
u.nombre,apellidoM,apellidoP,o.idDriver
from
users u natural join driver o
natural join collections c
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is null)
order by nombre asc;

select
u.nombre,apellidoM,apellidoP,o.idDriver
from
users u natural join driver o
natural join collections c
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is null)
order by nombre desc;

select
u.nombre,apellidoM,apellidoP,o.idDriver
from
users u natural join driver o
natural join collections c
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is null)
and u.nombre like "abc"

--gestionar operadores en ruta
select
distinct
u.nombre,apellidoM,apellidoP,r.nombre
from
users u natural join driver o
natural join collections c
natural join donors d
natural join Routes r
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is not null)
and u.nombre like "abc"

select
distinct
u.nombre,apellidoM,apellidoP,r.nombre
from
users u natural join driver o
natural join collections c
natural join donors d
natural join Routes r
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is not null)
order by u.nombre asc;

select
distinct
u.nombre,apellidoM,apellidoP,r.nombre
from
users u natural join driver o
natural join collections c
natural join donors d
natural join Routes r
where
o.idDriver in
(select 
o.idDriver 
from 
driver o left join Collections c on o.idDriver=c.idDriver
where fechaRecoleccion="2020-01-01" and c.idDriver is not null)
order by u.nombre desc;

--Detalle operador ruta
select
u.nombre,u.apellidoP,c.idDriver,fechaRecoleccion,folio,nota,cantidad,calle,cp,colonia,estado,num_exterior
from
users u natural join driver o
natural join collections c
natural join collectedQuantities
join donors d on d.idDonor=c.idDonor
where 
idDriver=idEDOARDO  and fechaRecoleccion=hoy and recolectado=1;

--asignar rutas de entrega

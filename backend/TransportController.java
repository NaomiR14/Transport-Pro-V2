package com.transport.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.transport.model.OrdenTransporte;
import com.transport.service.TransportService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "*")
public class TransportController {

    @Autowired
    private TransportService transportService;

    @GetMapping("/ordenes")
    public ResponseEntity<List<OrdenTransporte>> getAllOrdenes() {
        List<OrdenTransporte> ordenes = transportService.getAllOrdenes();
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/ordenes/{id}")
    public ResponseEntity<OrdenTransporte> getOrdenById(@PathVariable UUID id) {
        OrdenTransporte orden = transportService.getOrdenById(id);
        if (orden != null) {
            return ResponseEntity.ok(orden);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/ordenes")
    public ResponseEntity<OrdenTransporte> createOrden(@RequestBody OrdenTransporte orden) {
        OrdenTransporte newOrden = transportService.createOrden(orden);
        return ResponseEntity.ok(newOrden);
    }

    @PutMapping("/ordenes/{id}")
    public ResponseEntity<OrdenTransporte> updateOrden(
            @PathVariable UUID id, 
            @RequestBody OrdenTransporte orden) {
        OrdenTransporte updatedOrden = transportService.updateOrden(id, orden);
        if (updatedOrden != null) {
            return ResponseEntity.ok(updatedOrden);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/ordenes/{id}")
    public ResponseEntity<Void> deleteOrden(@PathVariable UUID id) {
        boolean deleted = transportService.deleteOrden(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/ordenes/estado/{estado}")
    public ResponseEntity<List<OrdenTransporte>> getOrdenesByEstado(@PathVariable String estado) {
        List<OrdenTransporte> ordenes = transportService.getOrdenesByEstado(estado);
        return ResponseEntity.ok(ordenes);
    }
}

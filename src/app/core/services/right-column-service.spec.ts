import { TestBed } from "@angular/core/testing";
import { RightColumnService } from "./right-column-service";

describe('RightColumnService', () => {
    let service: RightColumnService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RightColumnService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Open state tests
    it('should open the right column', (done) => {
        service.open();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeTrue();
        done();
        });
    });

    // Close state tests
    it('should close the right column', (done) => {
        service.close();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeFalse();
        done();
        });
    });

    // Toggle state tests
    it('should toggle the right column state', (done) => {
        service.open();
        service.toggle();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeFalse();
        done();
        });
    });
});
import { TestBed } from "@angular/core/testing";
import { LeftColumnService } from "./left-column-service";

describe('LeftColumnService', () => {
    let service: LeftColumnService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LeftColumnService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Open state tests
    it('should open the left column', (done) => {
        service.open();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeTrue();
        done();
        });
    });

    // Close state tests
    it('should close the left column', (done) => {
        service.close();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeFalse();
        done();
        });
    });

    // Toggle state tests
    it('should toggle the left column state', (done) => {
        service.open();
        service.toggle();
        service.openState$.subscribe((open: boolean) => {
        expect(open).toBeFalse();
        done();
        });
    });
});
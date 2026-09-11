import type { DateRange, Vehicle } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icons';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { VehicleCard } from '@/components/fleet/VehicleCard';

interface FleetPreviewProps {
  vehicles: Vehicle[];
  range?: DateRange;
}

export function FleetPreview({ vehicles, range }: FleetPreviewProps) {
  return (
    <section id="frota" aria-labelledby="frota-titulo" className="bg-paper-alt">
      <div className="container-page py-16 lg:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nossa frota"
            title={
              <span id="frota-titulo">
                Carros para o dia a dia, para o trabalho e para a estrada
              </span>
            }
            description="Do compacto econômico à picape de cabine dupla. Escolha pelo que você precisa: lugares, porta-malas, câmbio e consumo."
          />
          <span className="hidden shrink-0 sm:block">
            <Button
              href="/frota"
              variant="outline"
              trailingIcon={<ArrowRight className="size-4" />}
            >
              Ver frota completa
            </Button>
          </span>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {vehicles.map((vehicle, index) => (
            <Reveal key={vehicle.id} delay={index * 60}>
              <VehicleCard vehicle={vehicle} range={range} />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Button
            href="/frota"
            variant="outline"
            fullWidth
            trailingIcon={<ArrowRight className="size-4" />}
          >
            Ver frota completa
          </Button>
        </div>
      </div>
    </section>
  );
}

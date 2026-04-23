/**
 * Referência de estudos militares da Academia no nível máximo (30).
 * Baseado nos efeitos exibidos no jogo (tooltips), p.ex. Leadership +65% faculdade,
 * Medication +75% HP das tropas, Security +65% defesa das tropas, Footpace +65% ofensiva da infantaria.
 *
 * Os valores numéricos não são expostos na interface; a UI apenas indica que o cálculo
 * considera um referencial equivalente a estudos no nível máximo.
 */
export const ACADEMY_REFERENCE_LEVEL = 30;

/** Texto curto para uso na UI (sem percentuais). */
export const ACADEMY_REFERENCE_DESCRIPTION =
  'Os cálculos incorporam um fator equivalente a estudos militares da Academia no nível máximo de referência.';

/**
 * Multiplicadores no nível máximo de referência (coerentes com tooltips Lv 30 onde informados).
 * Tecnologias sem texto explícito no jogo seguem o padrão +65% observado nas demais.
 */
export const AcademyMax = {
  /** Leadership: +65% faculdade do herói */
  leadershipFaculty: 1.65,
  /** Security: +65% defesa das tropas */
  securityTroopDefense: 1.65,
  /** Medication: +75% HP das tropas */
  medicationTroopHp: 1.75,
  /** Footpace: +65% ofensiva da infantaria (Hastatus, Principes) */
  footpaceInfantryOffense: 1.65,
  /** Equitation: +65% ofensiva da cavalaria (Equites) */
  equitationCavalryOffense: 1.65,
  /** Reconnaissance: +65% (unidades de retaguarda) */
  reconnaissanceRearOffense: 1.65,
  /** Arming: referência máxima +65% (componente de dano base da unidade) */
  armingDamage: 1.65,
} as const;
